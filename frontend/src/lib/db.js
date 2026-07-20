import { supabase } from './supabase.js';
import { LESSON_COUNT_BADGES, STREAK_BADGES, LEVEL_BADGE_BY_ORDER } from './badges.js';

// All helpers here return camelCase-shaped objects so page components don't
// deal with snake_case Postgres columns directly.

const PASS_THRESHOLD = 70;

export function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    subscriptionStatus: row.subscription_status,
    subscriptionPlan: row.subscription_plan,
    subscriptionTier: row.subscription_tier,
    stripeCustomerId: row.stripe_customer_id,
    currentPeriodEnd: row.current_period_end,
  };
}

function mapChildRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    currentStageId: row.current_stage_id,
    maxStageId: row.max_stage_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Child profiles
// ---------------------------------------------------------------------------

export async function listChildren(parentId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at');
  if (error) throw new Error(error.message);
  return data.map(mapChildRow);
}

/** Standard-tier parents get one child; Family is uncapped for now — the
 * DB-side enforce_child_limit() trigger is the actual source of truth, this
 * just surfaces its error message cleanly. */
export async function createChildProfile({ parentId, name, dateOfBirth, startingStageId, maxStageId }) {
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      parent_id: parentId,
      name,
      date_of_birth: dateOfBirth || null,
      current_stage_id: startingStageId,
      max_stage_id: maxStageId ?? startingStageId,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapChildRow(data);
}

export async function renameChildProfile(childId, name) {
  const { error } = await supabase.from('child_profiles').update({ name }).eq('id', childId);
  if (error) throw new Error(error.message);
}

/** Highest-order stage whose min_placement_age is still <= age — a stand-in
 * for the adaptive placement test (deferred to a later workstream). */
export function computeMaxStageForAge(age, stagesOrdered) {
  if (!stagesOrdered.length) return null;
  let allowed = stagesOrdered[0].id;
  for (const stage of stagesOrdered) {
    if (stage.minPlacementAge <= age) allowed = stage.id;
  }
  return allowed;
}

export function ageFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

// ---------------------------------------------------------------------------
// Placement test — one diagnostic question per stage, bisected into a short
// ~4-5 question test instead of asking all 16 (assumes mastery is roughly
// monotonic: a child who passes stage 10's question can be presumed to know
// stages 1-9's material too).
// ---------------------------------------------------------------------------

/** Given the 16 placement questions, the highest stage order index the child
 * is eligible for by age, and every answer given so far (in order, each
 * `{ stageOrderIndex, correct }`), returns either the next question to ask
 * or the converged placement. Stateless — recomputes the [lo, hi] bounds
 * from the answer history every call, so the caller only needs to persist
 * the answers array. */
export function nextPlacementStep(questions, maxOrderIndex, answeredSoFar) {
  let lo = 1;
  let hi = maxOrderIndex;
  for (const a of answeredSoFar) {
    if (a.correct) lo = Math.max(lo, a.stageOrderIndex);
    else hi = Math.min(hi, a.stageOrderIndex - 1);
  }
  if (lo >= hi || answeredSoFar.length >= 5) {
    return { done: true, placedOrderIndex: Math.max(1, lo) };
  }
  const mid = Math.ceil((lo + hi) / 2);
  const question = questions.find((q) => q.stageOrderIndex === mid);
  return { done: false, question };
}

export async function getPlacementQuestions() {
  const { data, error } = await supabase
    .from('placement_questions')
    .select('id, stage_id, instruction, options, correct_answer, stages!inner(order_index)')
    .order('id');
  if (error) throw new Error(error.message);
  return data.map((q) => ({
    id: q.id,
    stageId: q.stage_id,
    stageOrderIndex: q.stages.order_index,
    instruction: q.instruction,
    options: q.options,
    correctAnswer: q.correct_answer,
  }));
}

export async function submitPlacementResult({ childId, rawAnswers, placedStageId }) {
  const { error } = await supabase
    .from('placement_results')
    .insert({ child_id: childId, raw_answers: rawAnswers, placed_stage_id: placedStageId });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Curriculum (levels -> stages) — public, no entitlement needed to browse
// the map itself.
// ---------------------------------------------------------------------------

export async function getCurriculum() {
  const [{ data: levels, error: levelsError }, { data: stages, error: stagesError }] = await Promise.all([
    supabase.from('levels').select('*').order('order_index'),
    supabase.from('stages').select('*').order('order_index'),
  ]);
  if (levelsError) throw new Error(levelsError.message);
  if (stagesError) throw new Error(stagesError.message);

  const mappedStages = stages.map((s) => ({
    id: s.id,
    levelId: s.level_id,
    name: s.name,
    orderIndex: s.order_index,
    videoUrl: s.video_url,
    minPlacementAge: s.min_placement_age,
    isFree: s.is_free,
  }));

  const mappedLevels = levels.map((level) => ({
    id: level.id,
    name: level.name,
    orderIndex: level.order_index,
    description: level.description,
    stages: mappedStages.filter((s) => s.levelId === level.id),
  }));

  return { levels: mappedLevels, stages: mappedStages };
}

// ---------------------------------------------------------------------------
// Lessons within a stage
// ---------------------------------------------------------------------------

/** Metadata for every lesson in a stage (via the list_stage_lessons RPC, so
 * locked lessons still show up with a title/padlock) plus this child's
 * progress on each. `stageUnlocked` (whether the child has progressed far
 * enough to be in this stage at all) is computed by the caller from
 * current_stage_id ordering and combined with the payment paywall here. */
export async function listStageLessonsForChild(stageId, { childId, isPaidUser, stageUnlocked }) {
  const { data: meta, error: metaError } = await supabase.rpc('list_stage_lessons', { p_stage_id: stageId });
  if (metaError) throw new Error(metaError.message);

  let progressByLessonId = new Map();
  if (childId) {
    const { data: progress, error: progressError } = await supabase
      .from('child_lesson_progress')
      .select('lesson_id, score, completed_at')
      .eq('child_id', childId);
    if (progressError) throw new Error(progressError.message);
    progressByLessonId = new Map(progress.map((p) => [p.lesson_id, p]));
  }

  return meta.map((lesson) => {
    const progress = progressByLessonId.get(lesson.id);
    const paywalled = !lesson.is_free && !isPaidUser;
    return {
      id: lesson.id,
      stageId: lesson.stage_id,
      orderIndex: lesson.order_index,
      title: lesson.title,
      arabicWord: lesson.arabic_word,
      isFree: lesson.is_free,
      estimatedMinutes: lesson.estimated_minutes,
      locked: !stageUnlocked || paywalled,
      paywalled,
      completed: !!progress?.completed_at,
    };
  });
}

const CHECKPOINT_INTERVAL = 3;

/** Whether finishing this lesson (by order_index, within a stage of
 * lessonCount lessons) triggers a checkpoint — every 3rd lesson, or the
 * last lesson of the stage (always a checkpoint, the final one being the
 * mastery exercise). */
export function isCheckpointDue(orderIndex, lessonCount) {
  return orderIndex % CHECKPOINT_INTERVAL === 0 || orderIndex === lessonCount;
}
export function checkpointOrderForLesson(orderIndex, lessonCount) {
  return Math.ceil(orderIndex / CHECKPOINT_INTERVAL) + (orderIndex === lessonCount && orderIndex % CHECKPOINT_INTERVAL !== 0 ? 1 : 0);
}

/** Single lesson's content. RLS silently returns zero rows for a lesson the
 * session isn't entitled to (no session-specific error), so we disambiguate
 * "doesn't exist" vs "locked" against the public metadata list. */
export async function getLessonDetail(stageId, orderIndex) {
  const orderNum = Number(orderIndex);

  const [{ data: lessonRow, error: lessonError }, { data: meta, error: metaError }] = await Promise.all([
    supabase.from('lessons').select('*').eq('stage_id', stageId).eq('order_index', orderNum).maybeSingle(),
    supabase.rpc('list_stage_lessons', { p_stage_id: stageId }),
  ]);
  if (lessonError) throw new Error(lessonError.message);
  if (metaError) throw new Error(metaError.message);

  const existsInStage = meta.some((m) => m.order_index === orderNum);
  if (!existsInStage) return { notFound: true };
  if (!lessonRow) return { locked: true };

  const lessonCount = meta.length;
  return {
    lesson: {
      id: lessonRow.id,
      stageId: lessonRow.stage_id,
      orderIndex: lessonRow.order_index,
      title: lessonRow.title,
      lessonGoal: lessonRow.lesson_goal,
      arabicWord: lessonRow.arabic_word,
      arabicWordMeaning: lessonRow.arabic_word_meaning,
      content: lessonRow.content,
      estimatedMinutes: lessonRow.estimated_minutes,
      hasNext: orderNum < lessonCount,
      checkpointDue: isCheckpointDue(orderNum, lessonCount),
      checkpointOrder: checkpointOrderForLesson(orderNum, lessonCount),
    },
  };
}

export async function completeLessonForChild({ childId, lessonId }) {
  const nowIso = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('child_lesson_progress')
    .select('attempts, completed_at')
    .eq('child_id', childId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error: upsertError } = await supabase.from('child_lesson_progress').upsert(
    {
      child_id: childId,
      lesson_id: lessonId,
      completed_at: existing?.completed_at ?? nowIso,
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempt_at: nowIso,
    },
    { onConflict: 'child_id,lesson_id' }
  );
  if (upsertError) throw new Error(upsertError.message);

  // Only the first completion of a given lesson should move the streak/badge
  // needle — repeat visits (attempts incrementing on an already-completed
  // lesson) shouldn't re-trigger it.
  if (!existing?.completed_at) {
    return updateStreakAndBadges(childId);
  }
  return { newBadges: [] };
}

// ---------------------------------------------------------------------------
// Stage checkpoints
// ---------------------------------------------------------------------------

export async function getStageCheckpoint(stageId, checkpointOrder) {
  const { data: se, error } = await supabase
    .from('stage_exercises')
    .select('*, exercise_questions(*)')
    .eq('stage_id', stageId)
    .eq('checkpoint_order', checkpointOrder)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!se) return null;

  return {
    id: se.id,
    stageId: se.stage_id,
    checkpointOrder: se.checkpoint_order,
    isMastery: se.is_mastery,
    questions: se.exercise_questions
      .slice()
      .sort((a, b) => a.question_number - b.question_number)
      .map((q) => ({
        id: q.id,
        questionNumber: q.question_number,
        title: q.title,
        instruction: q.instruction,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      })),
  };
}

/** Grades client-side (the child is only ever shown a checkpoint they're
 * entitled to). On a passed mastery checkpoint, records the stage as
 * mastered and awards badges - but does NOT advance current_stage_id yet.
 * Advancement happens after the stage-summary video (see
 * completeStageVideoForChild), so a child always sees the recap before
 * moving on. */
export async function completeCheckpointForChild({ childId, checkpoint, answers }) {
  let correct = 0;
  const results = checkpoint.questions.map((q) => {
    const isCorrect = answers[q.id] === q.correctAnswer;
    if (isCorrect) correct += 1;
    return { questionId: q.id, correct: isCorrect, explanation: q.explanation };
  });
  const score = Math.round((correct / checkpoint.questions.length) * 100);
  const passed = score >= PASS_THRESHOLD;

  let newBadges = [];
  if (checkpoint.isMastery && passed) {
    const nowIso = new Date().toISOString();
    const { error: progressError } = await supabase.from('child_stage_progress').upsert(
      { child_id: childId, stage_id: checkpoint.stageId, mastery_passed_at: nowIso, badge_earned_at: nowIso },
      { onConflict: 'child_id,stage_id' }
    );
    if (progressError) throw new Error(progressError.message);

    newBadges = await checkLevelBadge(childId, checkpoint.stageId);
  }

  return { score, passed, results, newBadges };
}

// ---------------------------------------------------------------------------
// Stage-summary video (reward/recap shown after a mastery checkpoint pass,
// before the child advances to the next stage)
// ---------------------------------------------------------------------------

/** Whether this child has mastered the stage (eligible to watch its recap
 * video) and whether they've already watched it. `videoUrl` is null until
 * the actual video is produced - the player shows a "coming soon" state in
 * that case, but the child can still continue past it. */
export async function getStageVideoStatus(childId, stageId) {
  const [{ data: stageRow, error: stageError }, { data: progressRow, error: progressError }] = await Promise.all([
    supabase.from('stages').select('video_url').eq('id', stageId).single(),
    supabase.from('child_stage_progress').select('mastery_passed_at, video_watched_at').eq('child_id', childId).eq('stage_id', stageId).maybeSingle(),
  ]);
  if (stageError) throw new Error(stageError.message);
  if (progressError) throw new Error(progressError.message);

  return {
    videoUrl: stageRow.video_url,
    mastered: !!progressRow?.mastery_passed_at,
    alreadyWatched: !!progressRow?.video_watched_at,
  };
}

/** Marks the stage's recap video as watched and advances the child to the
 * next stage (or leaves current_stage_id alone if this was the final
 * stage - nextStageId is null for the Stage 16 capstone). */
export async function completeStageVideoForChild({ childId, stageId, nextStageId }) {
  const { error: watchedError } = await supabase
    .from('child_stage_progress')
    .update({ video_watched_at: new Date().toISOString() })
    .eq('child_id', childId)
    .eq('stage_id', stageId);
  if (watchedError) throw new Error(watchedError.message);

  if (nextStageId) {
    const { error: advanceError } = await supabase.from('child_profiles').update({ current_stage_id: nextStageId }).eq('id', childId);
    if (advanceError) throw new Error(advanceError.message);
  }
}

// ---------------------------------------------------------------------------
// Badges + streaks
// ---------------------------------------------------------------------------

async function awardBadges(childId, candidateCodes) {
  if (!candidateCodes.length) return [];
  const { data: existing, error: existingError } = await supabase.from('child_badges').select('badge_code').eq('child_id', childId);
  if (existingError) throw new Error(existingError.message);

  const already = new Set(existing.map((b) => b.badge_code));
  const toInsert = [...new Set(candidateCodes)].filter((code) => !already.has(code));
  if (!toInsert.length) return [];

  const { error: insertError } = await supabase
    .from('child_badges')
    .insert(toInsert.map((badge_code) => ({ child_id: childId, badge_code })));
  if (insertError) throw new Error(insertError.message);
  return toInsert;
}

/** Recomputes the streak from lesson-completion history, persists it to
 * child_profiles (current_streak / longest_streak), and awards any
 * newly-crossed lesson-count or streak badges. */
export async function updateStreakAndBadges(childId) {
  const [{ data: lessonRows, error: lessonError }, { data: childRow, error: childError }] = await Promise.all([
    supabase.from('child_lesson_progress').select('completed_at').eq('child_id', childId).not('completed_at', 'is', null),
    supabase.from('child_profiles').select('longest_streak').eq('id', childId).single(),
  ]);
  if (lessonError) throw new Error(lessonError.message);
  if (childError) throw new Error(childError.message);

  const totalCompleted = lessonRows.length;
  const current = computeStreak(lessonRows.map((r) => r.completed_at));
  const longest = Math.max(childRow.longest_streak, current);

  const { error: updateError } = await supabase
    .from('child_profiles')
    .update({ current_streak: current, longest_streak: longest })
    .eq('id', childId);
  if (updateError) throw new Error(updateError.message);

  const candidates = [
    ...LESSON_COUNT_BADGES.filter((b) => totalCompleted >= b.threshold).map((b) => b.code),
    ...STREAK_BADGES.filter((b) => longest >= b.threshold).map((b) => b.code),
  ];
  const newBadges = await awardBadges(childId, candidates);
  return { current, longest, newBadges };
}

/** After a mastery checkpoint passes, checks whether every stage in that
 * stage's level is now mastered and awards the level-graduate badge if so. */
async function checkLevelBadge(childId, stageId) {
  const { data: stageRow, error: stageError } = await supabase
    .from('stages')
    .select('level_id, levels(order_index)')
    .eq('id', stageId)
    .single();
  if (stageError) throw new Error(stageError.message);

  const { data: levelStages, error: levelStagesError } = await supabase.from('stages').select('id').eq('level_id', stageRow.level_id);
  if (levelStagesError) throw new Error(levelStagesError.message);

  const { data: masteredRows, error: masteredError } = await supabase
    .from('child_stage_progress')
    .select('stage_id')
    .eq('child_id', childId)
    .in(
      'stage_id',
      levelStages.map((s) => s.id)
    )
    .not('mastery_passed_at', 'is', null);
  if (masteredError) throw new Error(masteredError.message);

  if (masteredRows.length < levelStages.length) return [];
  const badgeCode = LEVEL_BADGE_BY_ORDER[stageRow.levels.order_index];
  if (!badgeCode) return [];
  return awardBadges(childId, [badgeCode]);
}

/** Stage IDs the child has actually mastered (passed the mastery checkpoint
 * for) — distinct from "below their current stage," since the placement
 * test can put a child ahead of stages they never actually completed. */
export async function listMasteredStageIds(childId) {
  const { data, error } = await supabase
    .from('child_stage_progress')
    .select('stage_id')
    .eq('child_id', childId)
    .not('mastery_passed_at', 'is', null);
  if (error) throw new Error(error.message);
  return data.map((r) => r.stage_id);
}

export async function listChildBadges(childId) {
  const { data, error } = await supabase.from('child_badges').select('badge_code, earned_at').eq('child_id', childId);
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Progress (per child)
// ---------------------------------------------------------------------------

function computeStreak(completedDates) {
  const days = new Set(completedDates.map((d) => new Date(d).toISOString().slice(0, 10)));
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!days.has(todayStr)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getChildProgressSummary(childId) {
  const [{ data: lessonRows, error: lessonError }, { data: stageRows, error: stageError }, { data: childRow, error: childError }, badgeRows] =
    await Promise.all([
      supabase
        .from('child_lesson_progress')
        .select('completed_at, last_attempt_at, lesson_id, lessons(order_index, title, stages(name, order_index))')
        .eq('child_id', childId),
      supabase.from('child_stage_progress').select('stage_id, mastery_passed_at').eq('child_id', childId).not('mastery_passed_at', 'is', null),
      supabase.from('child_profiles').select('longest_streak').eq('id', childId).single(),
      listChildBadges(childId),
    ]);
  if (lessonError) throw new Error(lessonError.message);
  if (stageError) throw new Error(stageError.message);
  if (childError) throw new Error(childError.message);

  const completedLessons = lessonRows.filter((r) => r.completed_at);
  // Computed live (not read from the persisted column) so the current streak
  // stays accurate even if a day has passed since the last badge-check run.
  const streak = computeStreak(completedLessons.map((r) => r.completed_at));

  const recent = [...completedLessons]
    .sort((a, b) => new Date(b.last_attempt_at || b.completed_at) - new Date(a.last_attempt_at || a.completed_at))
    .slice(0, 5)
    .map((r) => ({
      lessonId: r.lesson_id,
      stageName: r.lessons.stages.name,
      lessonOrderIndex: r.lessons.order_index,
      title: r.lessons.title,
    }));

  return {
    totalLessonsCompleted: completedLessons.length,
    totalLessonsAttempted: lessonRows.length,
    stagesCompleted: stageRows.length,
    streak,
    longestStreak: Math.max(childRow.longest_streak, streak),
    badges: badgeRows.map((b) => b.badge_code),
    recent,
  };
}

export async function submitContactMessage({ name, email, message }) {
  const { error } = await supabase.from('contact_messages').insert({ name, email, message });
  if (error) throw new Error(error.message);
}
