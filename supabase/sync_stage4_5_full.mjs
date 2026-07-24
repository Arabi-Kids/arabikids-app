// Standalone, scoped-destructive update for the LIVE project - Stage 4 and
// Stage 5 grew from 8 lessons each to 9 (tajweed/madd-typology content
// woven in), which `sync_lesson_content.mjs` cannot handle (it only updates
// the `content` column of already-existing lesson rows, never inserts new
// ones or touches stage_exercises/exercise_questions). This script deletes
// and re-inserts ONLY those two stages' lessons/stage_exercises rows from
// seed.mjs's current STAGE_ITEMS/buildLessons output - every other stage is
// untouched.
//
// SAFE: child_stage_progress (per-STAGE mastery state) is keyed by stage_id,
// which is never deleted here - only that stage's child lessons/checkpoints
// are, so a child's Stage 4/5 mastery badge/unlock status survives.
// NOT SAFE: child_lesson_progress rows for Stage 4/5's OLD lesson ids will
// cascade-delete along with those lessons - any child's per-lesson
// completion history in Stage 4/5 specifically is lost. Only run this
// knowingly; check first whether any real child (beyond the test account)
// has progress there.
//
// Usage: node supabase/sync_stage4_5_full.mjs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { STAGES, STAGE_ITEMS, buildLessons, buildStageCheckpoints } from './seed.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in the environment (.env).');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// Also covers stages 13-16, whose lesson counts changed when tajweed rules
// (izhar, iqlab, meem sakinah, madd 'aarid, qalqalah kubra, waqf) were woven
// into the higher stages - same reasoning as stage 4/5 above applies to
// each: stage-level mastery survives, per-lesson history in that specific
// stage does not.
const TARGET_STAGE_KEYS = process.argv[2] ? process.argv[2].split(',') : ['stage4', 'stage5', 'stage13', 'stage14', 'stage15', 'stage16'];

async function run() {
  const { data: dbStages, error: stagesError } = await supabase.from('stages').select('id, order_index, is_free');
  if (stagesError) throw new Error(stagesError.message);
  const dbStageByOrder = new Map(dbStages.map((s) => [s.order_index, s]));

  for (const stageKey of TARGET_STAGE_KEYS) {
    const stage = STAGES.find((s) => s.key === stageKey);
    const dbStage = dbStageByOrder.get(stage.order_index);
    if (!dbStage) {
      console.warn(`No DB stage found for order_index ${stage.order_index} (${stage.name}) - skipping.`);
      continue;
    }
    const stageId = dbStage.id;

    console.log(`\n${stage.name} (stage_id ${stageId}):`);

    const { data: existingLessons } = await supabase.from('lessons').select('id').eq('stage_id', stageId);
    const existingLessonIds = (existingLessons || []).map((l) => l.id);
    if (existingLessonIds.length) {
      const { count: progressCount } = await supabase
        .from('child_lesson_progress')
        .select('id', { count: 'exact', head: true })
        .in('lesson_id', existingLessonIds);
      if (progressCount) {
        console.log(`  WARNING: ${progressCount} child_lesson_progress row(s) exist for this stage's current lessons - these will be deleted (cascade).`);
      }
    }

    const { error: delQError } = await supabase
      .from('exercise_questions')
      .delete()
      .in(
        'stage_exercise_id',
        (await supabase.from('stage_exercises').select('id').eq('stage_id', stageId)).data?.map((r) => r.id) || []
      );
    if (delQError) throw new Error(`Failed to delete old exercise_questions for ${stage.name}: ${delQError.message}`);

    const { error: delSEError } = await supabase.from('stage_exercises').delete().eq('stage_id', stageId);
    if (delSEError) throw new Error(`Failed to delete old stage_exercises for ${stage.name}: ${delSEError.message}`);

    const { error: delLessonsError } = await supabase.from('lessons').delete().eq('stage_id', stageId);
    if (delLessonsError) throw new Error(`Failed to delete old lessons for ${stage.name}: ${delLessonsError.message}`);

    const items = STAGE_ITEMS[stageKey];
    const lessons = buildLessons(stageKey, items).map((l) => ({
      stage_id: stageId,
      order_index: l.order_index,
      title: l.title,
      lesson_goal: l.lesson_goal,
      arabic_word: l.arabic_word,
      arabic_word_meaning: l.arabic_word_meaning,
      content: l.content,
      is_free: dbStage.is_free,
      estimated_minutes: l.estimated_minutes,
    }));

    const { error: lessonsError } = await supabase.from('lessons').insert(lessons);
    if (lessonsError) throw new Error(`Failed to insert new lessons for ${stage.name}: ${lessonsError.message}`);
    console.log(`  Inserted ${lessons.length} lessons.`);

    const checkpoints = buildStageCheckpoints(items);
    for (const cp of checkpoints) {
      const { data: seRow, error: seError } = await supabase
        .from('stage_exercises')
        .insert({ stage_id: stageId, checkpoint_order: cp.checkpoint_order, is_mastery: cp.is_mastery })
        .select('id')
        .single();
      if (seError) throw new Error(`Failed to insert checkpoint for ${stage.name}: ${seError.message}`);

      const questionRows = cp.questions.map((q) => ({
        stage_exercise_id: seRow.id,
        question_number: q.question_number,
        title: q.title,
        instruction: q.instruction,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      }));
      const { error: qError } = await supabase.from('exercise_questions').insert(questionRows);
      if (qError) throw new Error(`Failed to insert questions for ${stage.name} checkpoint ${cp.checkpoint_order}: ${qError.message}`);
    }
    console.log(`  Inserted ${checkpoints.length} checkpoints.`);
  }

  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
