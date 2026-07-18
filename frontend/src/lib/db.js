import { supabase } from './supabase.js';

// All helpers here return camelCase-shaped objects so the page components
// (written against the old Express API's JSON shape) didn't need to be
// rewritten field-by-field on top of the Postgres migration.

export function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    childName: row.child_name,
    ageGroup: row.age_group,
    role: row.role,
    subscriptionStatus: row.subscription_status,
    subscriptionPlan: row.subscription_plan,
    stripeCustomerId: row.stripe_customer_id,
    currentPeriodEnd: row.current_period_end,
  };
}

function mapExerciseRow(row) {
  return {
    id: row.id,
    exerciseNumber: row.exercise_number,
    title: row.title,
    instruction: row.instruction,
    options: row.options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
  };
}

/**
 * Full listing (all 45 lessons) for the Lesson Hub, including lock/free/
 * completed state. Uses the `list_lessons` RPC for metadata (which is
 * readable by everyone regardless of entitlement) so locked lessons still
 * show up with a padlock instead of disappearing.
 */
export async function listLessonsForHub(ageGroup, { userId, isPaidUser }) {
  const { data: meta, error: metaError } = await supabase.rpc('list_lessons', { p_age_group: ageGroup });
  if (metaError) throw new Error(metaError.message);

  let progressByLessonId = new Map();
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('lesson_id, score, completed_at')
      .eq('user_id', userId);
    if (progressError) throw new Error(progressError.message);
    progressByLessonId = new Map(progress.map((p) => [p.lesson_id, p]));
  }

  return meta.map((lesson) => {
    const progress = progressByLessonId.get(lesson.id);
    return {
      id: lesson.id,
      lessonNumber: lesson.lesson_number,
      title: lesson.title,
      arabicWord: lesson.arabic_word,
      isFree: lesson.is_free,
      estimatedMinutes: lesson.estimated_minutes,
      locked: !lesson.is_free && !isPaidUser,
      completed: !!progress?.completed_at,
      score: progress?.score ?? null,
    };
  });
}

/**
 * Single lesson + exercises. RLS silently returns zero rows (no error) for
 * a lesson the current session isn't entitled to, instead of an error with
 * a particular message to string-match — so we disambiguate "doesn't
 * exist" vs "locked" against the public metadata list, and also derive
 * hasNext from it.
 */
export async function getLessonDetail(ageGroup, lessonNumber) {
  const lessonNum = Number(lessonNumber);

  const [{ data: lessonRow, error: lessonError }, { data: meta, error: metaError }] = await Promise.all([
    supabase
      .from('lessons')
      .select('*, exercises(*)')
      .eq('age_group', ageGroup)
      .eq('lesson_number', lessonNum)
      .maybeSingle(),
    supabase.rpc('list_lessons', { p_age_group: ageGroup }),
  ]);

  if (lessonError) throw new Error(lessonError.message);
  if (metaError) throw new Error(metaError.message);

  const existsInGroup = meta.some((m) => m.lesson_number === lessonNum);
  if (!existsInGroup) return { notFound: true };
  if (!lessonRow) return { locked: true };

  const maxLessonNumber = Math.max(...meta.map((m) => m.lesson_number));

  return {
    lesson: {
      id: lessonRow.id,
      lessonNumber: lessonRow.lesson_number,
      title: lessonRow.title,
      lessonGoal: lessonRow.lesson_goal,
      arabicWord: lessonRow.arabic_word,
      arabicWordMeaning: lessonRow.arabic_word_meaning,
      content: lessonRow.content,
      estimatedMinutes: lessonRow.estimated_minutes,
      hasNext: lessonNum < maxLessonNumber,
    },
    exercises: lessonRow.exercises
      .slice()
      .sort((a, b) => a.exercise_number - b.exercise_number)
      .map(mapExerciseRow),
  };
}

const PASS_THRESHOLD = 70;

/** Grades client-side against the exercises already fetched for this lesson (the
 * user is only ever shown exercises for lessons they're entitled to). If
 * `userId` is null (an anonymous visitor trying a free lesson), grading still
 * works but nothing is saved — the caller should prompt them to sign up to
 * keep their progress. */
export async function completeLesson({ userId, lessonId, exercises, answers }) {
  let correctCount = 0;
  const results = exercises.map((ex) => {
    const isCorrect = answers[ex.id] === ex.correctAnswer;
    if (isCorrect) correctCount += 1;
    return { exerciseId: ex.id, correct: isCorrect, explanation: ex.explanation };
  });
  const score = Math.round((correctCount / exercises.length) * 100);
  const completed = score >= PASS_THRESHOLD;

  if (!userId) {
    return { score, completed, results, saved: false };
  }

  const nowIso = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from('user_progress')
    .select('score, attempts, completed_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error: upsertError } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      score: Math.max(score, existing?.score ?? 0),
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempt_at: nowIso,
      completed_at: completed ? existing?.completed_at ?? nowIso : existing?.completed_at ?? null,
    },
    { onConflict: 'user_id,lesson_id' }
  );
  if (upsertError) throw new Error(upsertError.message);

  return { score, completed, results, saved: true };
}

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

export async function getProgressSummary(userId) {
  const { data: rows, error } = await supabase
    .from('user_progress')
    .select('score, completed_at, attempts, last_attempt_at, lesson_id, lessons(age_group, lesson_number, title)')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const totalCompleted = rows.filter((r) => r.completed_at).length;
  const totalAttempted = rows.length;
  const streak = computeStreak(rows.filter((r) => r.completed_at).map((r) => r.completed_at));

  const recent = [...rows]
    .sort((a, b) => new Date(b.last_attempt_at || b.completed_at || 0) - new Date(a.last_attempt_at || a.completed_at || 0))
    .slice(0, 5)
    .map((r) => ({
      lessonId: r.lesson_id,
      ageGroup: r.lessons.age_group,
      lessonNumber: r.lessons.lesson_number,
      title: r.lessons.title,
      score: r.score,
      attempts: r.attempts,
      completed: !!r.completed_at,
    }));

  return { totalCompleted, totalAttempted, streak, recent };
}

export async function submitContactMessage({ name, email, message }) {
  const { error } = await supabase.from('contact_messages').insert({ name, email, message });
  if (error) throw new Error(error.message);
}
