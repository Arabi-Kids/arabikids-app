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
    language: row.language,
  };
}

export async function updateUserLanguage(userId, language) {
  const { error } = await supabase.from('users').update({ language }).eq('id', userId);
  if (error) throw new Error(error.message);
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

/** correct_index (not text) is what identifies the right answer, since the
 * displayed option strings are localized - matching by text against the
 * English correct_answer would break once the child is shown translated
 * options. Instruction/options fall back to English per-field when a
 * translation is missing, same pattern as lesson content. */
export async function getPlacementQuestions(language = 'en') {
  const { data, error } = await supabase
    .from('placement_questions')
    .select(
      'id, stage_id, instruction, instruction_ar, instruction_ms, options, options_ar, options_ms, correct_index, stages!inner(order_index)'
    )
    .order('id');
  if (error) throw new Error(error.message);
  return data.map((q) => {
    const instruction =
      (language === 'ar' ? q.instruction_ar : language === 'ms' ? q.instruction_ms : null) ?? q.instruction;
    const options =
      (language === 'ar' ? q.options_ar : language === 'ms' ? q.options_ms : null) ?? q.options;
    return {
      id: q.id,
      stageId: q.stage_id,
      stageOrderIndex: q.stages.order_index,
      instruction,
      options,
      correctAnswer: options[q.correct_index],
    };
  });
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

/** language defaults to 'en' for the (many) callers that don't yet pass it
 * through - name/description/intro fields fall back to their English
 * column per-field when a translation is missing, same pattern as lesson
 * content. */
export async function getCurriculum(language = 'en') {
  const [{ data: levels, error: levelsError }, { data: stages, error: stagesError }] = await Promise.all([
    supabase.from('levels').select('*').order('order_index'),
    supabase.from('stages').select('*').order('order_index'),
  ]);
  if (levelsError) throw new Error(levelsError.message);
  if (stagesError) throw new Error(stagesError.message);

  const pick = (row, base) => (language === 'ar' ? row[`${base}_ar`] : language === 'ms' ? row[`${base}_ms`] : null) ?? row[base];

  const mappedStages = stages.map((s) => ({
    id: s.id,
    levelId: s.level_id,
    name: pick(s, 'name'),
    orderIndex: s.order_index,
    videoUrl: s.video_url,
    minPlacementAge: s.min_placement_age,
    isFree: s.is_free,
    introKids: pick(s, 'intro_kids'),
    introParents: pick(s, 'intro_parents'),
  }));

  const mappedLevels = levels.map((level) => ({
    id: level.id,
    name: pick(level, 'name'),
    orderIndex: level.order_index,
    description: pick(level, 'description'),
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
export async function listStageLessonsForChild(stageId, { childId, isPaidUser, stageUnlocked, language = 'en' }) {
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
    const title = (language === 'ar' ? lesson.title_ar : language === 'ms' ? lesson.title_ms : null) ?? lesson.title;
    return {
      id: lesson.id,
      stageId: lesson.stage_id,
      orderIndex: lesson.order_index,
      title,
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
export async function getLessonDetail(stageId, orderIndex, language = 'en') {
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

  // content_ar/content_ms are optional per-lesson translated blobs (see
  // supabase/add_language_preference.sql) - fall back to the English
  // content/title/etc for any lesson not yet translated, so rolling out
  // translation stage-by-stage never breaks an untranslated lesson.
  const localizedColumn = language === 'ar' ? 'content_ar' : language === 'ms' ? 'content_ms' : null;
  const localized = localizedColumn ? lessonRow[localizedColumn] : null;

  return {
    lesson: {
      id: lessonRow.id,
      stageId: lessonRow.stage_id,
      orderIndex: lessonRow.order_index,
      title: localized?.title ?? lessonRow.title,
      lessonGoal: localized?.lessonGoal ?? lessonRow.lesson_goal,
      arabicWord: lessonRow.arabic_word,
      arabicWordMeaning: localized?.arabicWordMeaning ?? lessonRow.arabic_word_meaning,
      // `image` is language-independent (a picture of a book is a picture
      // of a book in any language) and only ever set on the canonical
      // English content, so it's merged in regardless of which language
      // blob supplies everything else - otherwise it would silently
      // disappear for ar/ms readers since those are separate JSON blobs.
      content: { ...(localized?.content ?? lessonRow.content), image: lessonRow.content?.image },
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
// Qur'an pillar (quran_units / quran_ayahs / quran_word_connections) -
// independent of the Arabic Curriculum's levels/stages/lessons, see
// supabase/add_quran_pillar.sql. Same localization convention as
// getCurriculum's `pick` helper.
// ---------------------------------------------------------------------------

function pickLocalized(row, base, language) {
  return (language === 'ar' ? row[`${base}_ar`] : language === 'ms' ? row[`${base}_ms`] : null) ?? row[base];
}

function mapQuranUnitRow(row, language) {
  return {
    id: row.id,
    orderIndex: row.order_index,
    unitType: row.unit_type,
    surahNumber: row.surah_number,
    title: pickLocalized(row, 'title', language),
    ayahNumber: row.ayah_number,
    cumulativeThrough: row.cumulative_through,
    ayahRangeStart: row.ayah_range_start,
    ayahRangeEnd: row.ayah_range_end,
    isFree: row.is_free,
    estimatedMinutes: row.estimated_minutes,
  };
}

export async function getQuranUnits(language = 'en') {
  const [{ data: units, error: unitsError }, { data: surahs, error: surahsError }] = await Promise.all([
    supabase.from('quran_units').select('*').order('order_index'),
    supabase.from('quran_surahs').select('*').order('surah_number'),
  ]);
  if (unitsError) throw new Error(unitsError.message);
  if (surahsError) throw new Error(surahsError.message);

  const mappedUnits = units.map((u) => mapQuranUnitRow(u, language));
  return {
    surahs: surahs.map((s) => ({
      surahNumber: s.surah_number,
      name: s.name,
      nameArabic: s.name_arabic,
      totalAyahs: s.total_ayahs,
      units: mappedUnits.filter((u) => u.surahNumber === s.surah_number),
    })),
  };
}

export async function getQuranUnitDetail(orderIndex, language = 'en') {
  const { data: unitRow, error: unitError } = await supabase
    .from('quran_units')
    .select('*')
    .eq('order_index', Number(orderIndex))
    .maybeSingle();
  if (unitError) throw new Error(unitError.message);
  if (!unitRow) return { notFound: true };
  if (!unitRow.is_free) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { locked: true };
    const { data: profile } = await supabase.from('users').select('subscription_status, role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin' && profile?.subscription_status !== 'active') return { locked: true };
  }

  const { data: ayahRows, error: ayahError } = await supabase
    .from('quran_ayahs')
    .select('*')
    .eq('surah_number', unitRow.surah_number)
    .lte('ayah_number', unitRow.unit_type === 'surah_corner' ? unitRow.ayah_number : unitRow.ayah_range_end)
    .order('ayah_number');
  if (ayahError) throw new Error(ayahError.message);

  return {
    unit: mapQuranUnitRow(unitRow, language),
    ayahs: ayahRows.map((a) => ({
      ayahNumber: a.ayah_number,
      arabic: a.arabic,
      transliteration: a.transliteration,
      translation: pickLocalized(a, 'translation', language),
    })),
  };
}

export async function getQuranWordConnections(language = 'en') {
  const { data, error } = await supabase.from('quran_word_connections').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data.map((row) => ({
    id: row.id,
    arabicWord: row.arabic_word,
    wordMeaning: row.word_meaning,
    arabicCitation: row.arabic_citation,
    translation: pickLocalized(row, 'translation', language),
    reference: pickLocalized(row, 'reference', language),
    note: pickLocalized(row, 'note', language),
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
  }));
}

/** Same shape as completeLessonForChild, minus the streak/badge hook -
 * Qur'an-pillar progress is independent of the Arabic Curriculum's
 * stage-advancement machinery (deliberate scoping: no Hifz tracker/streak
 * integration this pass, see the plan's "explicit scoping call"). */
export async function completeQuranUnitForChild({ childId, quranUnitId, score = 100 }) {
  const nowIso = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('child_quran_progress')
    .select('attempts, completed_at')
    .eq('child_id', childId)
    .eq('quran_unit_id', quranUnitId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error: upsertError } = await supabase.from('child_quran_progress').upsert(
    {
      child_id: childId,
      quran_unit_id: quranUnitId,
      score,
      completed_at: existing?.completed_at ?? nowIso,
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempt_at: nowIso,
    },
    { onConflict: 'child_id,quran_unit_id' }
  );
  if (upsertError) throw new Error(upsertError.message);
}

// ---------------------------------------------------------------------------
// Stage checkpoints
// ---------------------------------------------------------------------------

/** correct_index (not text) identifies the right answer, since displayed
 * option strings are localized - matching by text against the English
 * correct_answer would break once options are translated, same pattern as
 * placement_questions. */
function mapExerciseQuestion(q, language) {
  const title = (language === 'ar' ? q.title_ar : language === 'ms' ? q.title_ms : null) ?? q.title;
  const instruction = (language === 'ar' ? q.instruction_ar : language === 'ms' ? q.instruction_ms : null) ?? q.instruction;
  const options = (language === 'ar' ? q.options_ar : language === 'ms' ? q.options_ms : null) ?? q.options;
  const explanation = (language === 'ar' ? q.explanation_ar : language === 'ms' ? q.explanation_ms : null) ?? q.explanation;
  return {
    id: q.id,
    questionNumber: q.question_number,
    title,
    instruction,
    options,
    correctAnswer: q.correct_index != null ? options[q.correct_index] : q.correct_answer,
    explanation,
  };
}

export async function getStageCheckpoint(stageId, checkpointOrder, language = 'en') {
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
      .map((q) => mapExerciseQuestion(q, language)),
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
  const nowIso = new Date().toISOString();

  // Recorded for EVERY checkpoint (not just mastery ones) so the post-
  // checkpoint recap card can be gated/revisited later - mastery-checkpoint
  // passes additionally still update child_stage_progress below, unchanged.
  // Non-blocking: until add_checkpoint_progress.sql has been run, this table
  // doesn't exist yet - the core checkpoint-pass flow must still work either
  // way, so a failure here only disables the recap card, not completion.
  const { error: checkpointProgressError } = await supabase.from('child_checkpoint_progress').upsert(
    { child_id: childId, stage_exercise_id: checkpoint.id, score, passed_at: passed ? nowIso : null },
    { onConflict: 'child_id,stage_exercise_id' }
  );
  if (checkpointProgressError) console.warn('child_checkpoint_progress upsert failed (recap card will be unavailable):', checkpointProgressError.message);

  let newBadges = [];
  if (checkpoint.isMastery && passed) {
    const { error: progressError } = await supabase.from('child_stage_progress').upsert(
      { child_id: childId, stage_id: checkpoint.stageId, mastery_passed_at: nowIso, badge_earned_at: nowIso },
      { onConflict: 'child_id,stage_id' }
    );
    if (progressError) throw new Error(progressError.message);

    newBadges = await checkLevelBadge(childId, checkpoint.stageId);
  }

  return { score, passed, results, newBadges };
}

/** Whether this checkpoint has ever been passed by this child - gates
 * revisiting its recap card, mirroring getStageVideoStatus's "mastered"
 * gate pattern. Fails safe to { passed: false } (rather than throwing) if
 * child_checkpoint_progress doesn't exist yet (add_checkpoint_progress.sql
 * not yet run) - the caller shows "not unlocked yet" either way, not a
 * broken error page. */
export async function getCheckpointProgress(childId, stageExerciseId) {
  const { data, error } = await supabase
    .from('child_checkpoint_progress')
    .select('passed_at')
    .eq('child_id', childId)
    .eq('stage_exercise_id', stageExerciseId)
    .maybeSingle();
  if (error) {
    console.warn('getCheckpointProgress failed:', error.message);
    return { passed: false };
  }
  return { passed: !!data?.passed_at };
}

/** The recapGroup content attached to the last lesson of a checkpoint
 * window (see attachRecapGroups in supabase/seed.mjs) - fetched by stage +
 * checkpoint order rather than lesson order_index, since callers only know
 * "which checkpoint", not which lesson happens to be last in its window. */
export async function getRecapGroup(stageId, checkpointOrder, language = 'en') {
  const localizedColumn = language === 'ar' ? 'content_ar' : language === 'ms' ? 'content_ms' : null;
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(`content, order_index${localizedColumn ? `, ${localizedColumn}` : ''}`)
    .eq('stage_id', stageId)
    .order('order_index', { ascending: false });
  if (error) throw new Error(error.message);
  const match = lessons.find((l) => l.content?.recapGroup?.checkpointOrder === checkpointOrder);
  if (!match) return null;
  const localized = localizedColumn ? match[localizedColumn] : null;
  return localized?.content?.recapGroup ?? match.content?.recapGroup ?? null;
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

/** Aggregates the unique letters/tanween/tajweed/vocabulary/comparison content
 * taught across a level's stages, for that level's printable worksheet -
 * derived from the live `lessons` table (single source of truth) rather than
 * duplicating supabase/seed.mjs's data in the frontend bundle (that file is
 * Node-only - dotenv/node:url - and can't be imported into browser code).
 * Letters/tanween only ever appear in Level 1 (Stages 1-4); vocabulary and
 * comparisonSet cover every level, so the later levels' worksheets aren't
 * near-empty. `stageIds` optionally scopes the sheet to just the stages the
 * child has actually mastered so far (see LevelPrintable.jsx) instead of
 * every stage in the level - defaults to the whole level when omitted. */
export async function getLevelPrintableData(levelId, stageIds, language = 'en') {
  let stages;
  if (stageIds) {
    stages = stageIds.map((id) => ({ id }));
  } else {
    const { data, error: stagesError } = await supabase.from('stages').select('id').eq('level_id', levelId);
    if (stagesError) throw new Error(stagesError.message);
    stages = data;
  }
  if (stages.length === 0) return { letters: [], tajweedRules: [], tanweenForms: null, vocabulary: [], comparisons: [] };

  const localizedColumn = language === 'ar' ? 'content_ar' : language === 'ms' ? 'content_ms' : null;

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`title, arabic_word, arabic_word_meaning, content${localizedColumn ? `, ${localizedColumn}` : ''}`)
    .in(
      'stage_id',
      stages.map((s) => s.id)
    );
  if (lessonsError) throw new Error(lessonsError.message);

  const lettersByChar = new Map();
  const tajweedRules = [];
  let tanweenForms = null;
  const vocabularyByWord = new Map();
  const comparisonsByKey = new Map();

  for (const row of lessons) {
    const localized = localizedColumn ? row[localizedColumn] : null;
    const title = localized?.title ?? row.title;
    const meaning = localized?.arabicWordMeaning ?? row.arabic_word_meaning;
    const arabicWord = row.arabic_word;
    const content = localized?.content ?? row.content;

    if (content?.letters) {
      for (const l of content.letters) {
        if (!lettersByChar.has(l.letter)) lettersByChar.set(l.letter, { letter: l.letter, name: l.name, positions: l.positions });
      }
    }
    if (content?.tajweedRule) tajweedRules.push(content.tajweedRule);
    if (content?.tanweenForms) tanweenForms = content.tanweenForms;
    // Some words are reused verbatim across two lessons (e.g. an Idafa
    // example revisited in a later review lesson) - dedupe by the Arabic
    // text itself, same as the letters map above, so the printable doesn't
    // list the same word twice.
    if (content?.type !== 'reading' && arabicWord && !vocabularyByWord.has(arabicWord)) {
      vocabularyByWord.set(arabicWord, { arabic: arabicWord, meaning, transliteration: content?.transliteration, title });
    }
    if (content?.comparisonSet) {
      // Some pairs are authored twice (once per lesson, sides reversed) so
      // both lessons can show "the other side" - dedupe by the sorted set of
      // Arabic words so the printable only lists each pair once.
      const key = content.comparisonSet.items.map((it) => it.arabic).sort().join('|');
      if (!comparisonsByKey.has(key)) comparisonsByKey.set(key, content.comparisonSet);
    }
  }

  return {
    letters: [...lettersByChar.values()],
    tajweedRules,
    tanweenForms,
    vocabulary: [...vocabularyByWord.values()],
    comparisons: [...comparisonsByKey.values()],
  };
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

// ---------------------------------------------------------------------------
// Push notifications (streak reminders)
// ---------------------------------------------------------------------------

export async function savePushSubscription(childId, subscription) {
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      child_id: childId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'child_id,endpoint' }
  );
  if (error) throw new Error(error.message);
}

export async function deletePushSubscription(childId, endpoint) {
  const { error } = await supabase.from('push_subscriptions').delete().eq('child_id', childId).eq('endpoint', endpoint);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Stage Review Hub — a non-gating revisit space unlocked once a stage is
// mastered (Watch & Learn / My Vocabulary / Read / Write / Practice / Play).
// Nothing here ever writes to child_stage_progress or
// child_checkpoint_progress — nothing in this hub can affect real gating.
// ---------------------------------------------------------------------------

/** Every distinct vocabulary word taught in one stage, derived from the
 * `lessons` table itself (there is no separate vocabulary table) - same
 * dedupe-by-word approach as getLevelPrintableData, scoped to a single stage
 * and including each lesson's id so My Vocabulary/Write can key off it (e.g.
 * for favoriting). */
export async function getStageVocabulary(stageId, language = 'en') {
  const localizedColumn = language === 'ar' ? 'content_ar' : language === 'ms' ? 'content_ms' : null;
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(`id, arabic_word, arabic_word_meaning, content${localizedColumn ? `, ${localizedColumn}` : ''}`)
    .eq('stage_id', stageId)
    .order('order_index');
  if (error) throw new Error(error.message);

  const byWord = new Map();
  for (const row of lessons) {
    const localized = localizedColumn ? row[localizedColumn] : null;
    const content = localized?.content ?? row.content;
    const meaning = localized?.arabicWordMeaning ?? row.arabic_word_meaning;
    const arabic = row.arabic_word;
    if (content?.type === 'reading' || !arabic || byWord.has(arabic)) continue;
    byWord.set(arabic, { lessonId: row.id, arabic, meaning, transliteration: content?.transliteration });
  }
  return [...byWord.values()];
}

export async function getFavoriteWordIds(childId, stageId) {
  const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('id').eq('stage_id', stageId);
  if (lessonsError) throw new Error(lessonsError.message);
  const lessonIds = lessons.map((l) => l.id);
  if (lessonIds.length === 0) return [];

  const { data, error } = await supabase
    .from('stage_vocabulary_favorites')
    .select('lesson_id')
    .eq('child_id', childId)
    .in('lesson_id', lessonIds);
  if (error) throw new Error(error.message);
  return data.map((r) => r.lesson_id);
}

/** Toggles a word's favorite status; returns the new state (true = now favorited). */
export async function toggleFavoriteWord(childId, lessonId, currentlyFavorited) {
  if (currentlyFavorited) {
    const { error } = await supabase
      .from('stage_vocabulary_favorites')
      .delete()
      .eq('child_id', childId)
      .eq('lesson_id', lessonId);
    if (error) throw new Error(error.message);
    return false;
  }
  const { error } = await supabase
    .from('stage_vocabulary_favorites')
    .upsert({ child_id: childId, lesson_id: lessonId }, { onConflict: 'child_id,lesson_id' });
  if (error) throw new Error(error.message);
  return true;
}

export async function getStageReadingPassages(stageId, language = 'en') {
  const { data, error } = await supabase
    .from('stage_reading_passages')
    .select('id, text_content, translation, translation_ar, translation_ms, order_index')
    .eq('stage_id', stageId)
    .order('order_index');
  if (error) throw new Error(error.message);
  return data.map((p) => ({
    id: p.id,
    textContent: p.text_content,
    translation: (language === 'ar' ? p.translation_ar : language === 'ms' ? p.translation_ms : null) ?? p.translation,
    orderIndex: p.order_index,
  }));
}

/** The stage's mastery checkpoint (its highest checkpoint_order, is_mastery
 * true) - same shape as getStageCheckpoint, reused by the Practice tab as a
 * replayable, non-gating quiz. */
export async function getStageMasteryCheckpoint(stageId, language = 'en') {
  const { data: se, error } = await supabase
    .from('stage_exercises')
    .select('*, exercise_questions(*)')
    .eq('stage_id', stageId)
    .eq('is_mastery', true)
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
      .map((q) => mapExerciseQuestion(q, language)),
  };
}

/** Logs any Review Hub tab-open/attempt for parent-facing engagement
 * analytics later - purely additive, never read by gating logic. `score` is
 * optional (only Practice/Play attempts are scored). */
export async function logReviewActivity(childId, stageId, tabType, score = null) {
  const { error } = await supabase.from('review_activity').insert({ child_id: childId, stage_id: stageId, tab_type: tabType, score });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// In-app notification feed - reads what the admin portal broadcasts via
// send-admin-notification.js. Same table backs the admin's send-history
// list; this is the customer-facing side of it (see Account.jsx).
// ---------------------------------------------------------------------------

export async function getNotifications(limit = 20) {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('id, title, body, url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}
