// Standalone, additive-only update for the LIVE project - patches each
// existing lesson's `content` JSONB to add the new `transliteration` field
// (and `secondWord.transliteration` for letter-pair lessons), without
// touching any other table or column. Reuses seed.mjs's STAGES/STAGE_ITEMS/
// buildLessons so the regenerated content is byte-for-byte what a fresh
// seed would produce, just with transliteration now included - matched to
// existing lessons by (stage order_index, lesson order_index), not by
// re-inserting anything.
//
// Usage: node supabase/update_transliterations.mjs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { STAGES, STAGE_ITEMS, buildLessons } from './seed.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in the environment (.env).');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  const { data: dbStages, error: stagesError } = await supabase.from('stages').select('id, order_index');
  if (stagesError) throw new Error(stagesError.message);
  const stageIdByOrder = new Map(dbStages.map((s) => [s.order_index, s.id]));

  let updated = 0;
  let skipped = 0;

  for (const stage of STAGES) {
    const stageId = stageIdByOrder.get(stage.order_index);
    if (!stageId) {
      console.warn(`No DB stage found for order_index ${stage.order_index} (${stage.name}) - skipping.`);
      continue;
    }

    const items = STAGE_ITEMS[stage.key];
    const lessons = buildLessons(stage.key, items);

    for (const lesson of lessons) {
      const { data: existing, error: findError } = await supabase
        .from('lessons')
        .select('id')
        .eq('stage_id', stageId)
        .eq('order_index', lesson.order_index)
        .maybeSingle();
      if (findError) throw new Error(findError.message);
      if (!existing) {
        console.warn(`No DB lesson found for stage "${stage.name}" order_index ${lesson.order_index} - skipping.`);
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase.from('lessons').update({ content: lesson.content }).eq('id', existing.id);
      if (updateError) throw new Error(updateError.message);
      updated++;
    }
  }

  console.log(`Updated ${updated} lessons with transliteration. Skipped ${skipped} (no matching DB row).`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
