const pool = require('../config/db');

function isPaidStatus(status) {
  return status === 'active' || status === 'past_due';
}

function parseGroup(group) {
  return group === 'explorer' ? 'explorer' : 'junior';
}

// GET /api/lessons/:group
async function listLessons(req, res) {
  try {
    const ageGroup = parseGroup(req.params.group);
    const [lessons] = await pool.query(
      'SELECT id, age_group, lesson_number, title, lesson_goal, arabic_word, is_free, estimated_minutes FROM lessons WHERE age_group = ? ORDER BY lesson_number ASC',
      [ageGroup]
    );

    let progressMap = {};
    if (req.user) {
      const [progress] = await pool.query(
        `SELECT lesson_id, score, completed_at FROM user_progress
         WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE age_group = ?)`,
        [req.user.id, ageGroup]
      );
      progressMap = Object.fromEntries(progress.map((p) => [p.lesson_id, p]));
    }

    const [userRows] = req.user
      ? await pool.query('SELECT subscription_status FROM users WHERE id = ?', [req.user.id])
      : [[]];
    const userIsPaid = userRows[0] ? isPaidStatus(userRows[0].subscription_status) : false;

    const result = lessons.map((lesson) => ({
      id: lesson.id,
      ageGroup: lesson.age_group,
      lessonNumber: lesson.lesson_number,
      title: lesson.title,
      lessonGoal: lesson.lesson_goal,
      arabicWord: lesson.arabic_word,
      estimatedMinutes: lesson.estimated_minutes,
      isFree: !!lesson.is_free,
      locked: !lesson.is_free && !userIsPaid,
      completed: !!progressMap[lesson.id]?.completed_at,
      score: progressMap[lesson.id]?.score || 0,
    }));

    res.json({ ageGroup, lessons: result });
  } catch (err) {
    console.error('listLessons error:', err);
    res.status(500).json({ message: 'Failed to load lessons.' });
  }
}

// GET /api/lessons/:group/:id  (:id is the lesson_number within that age group)
async function getLesson(req, res) {
  try {
    const ageGroup = parseGroup(req.params.group);
    const lessonNumber = Number(req.params.id);
    const [rows] = await pool.query('SELECT * FROM lessons WHERE age_group = ? AND lesson_number = ?', [ageGroup, lessonNumber]);
    if (rows.length === 0) return res.status(404).json({ message: 'Lesson not found.' });
    const lesson = rows[0];

    let userIsPaid = false;
    if (req.user) {
      const [userRows] = await pool.query('SELECT subscription_status FROM users WHERE id = ?', [req.user.id]);
      userIsPaid = userRows[0] ? isPaidStatus(userRows[0].subscription_status) : false;
    }

    if (!lesson.is_free && !userIsPaid) {
      return res.status(403).json({ message: 'This lesson requires an active subscription.', locked: true });
    }

    const [exercises] = await pool.query(
      'SELECT id, exercise_number, title, instruction, options FROM exercises WHERE lesson_id = ? ORDER BY exercise_number ASC',
      [lesson.id]
    );

    const totalInGroup = (await pool.query('SELECT COUNT(*) AS c FROM lessons WHERE age_group = ?', [ageGroup]))[0][0].c;

    res.json({
      lesson: {
        id: lesson.id,
        ageGroup: lesson.age_group,
        lessonNumber: lesson.lesson_number,
        title: lesson.title,
        lessonGoal: lesson.lesson_goal,
        arabicWord: lesson.arabic_word,
        arabicWordMeaning: lesson.arabic_word_meaning,
        content: typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content,
        isFree: !!lesson.is_free,
        estimatedMinutes: lesson.estimated_minutes,
        hasNext: lesson.lesson_number < totalInGroup,
      },
      exercises: exercises.map((e) => ({
        id: e.id,
        exerciseNumber: e.exercise_number,
        title: e.title,
        instruction: e.instruction,
        options: typeof e.options === 'string' ? JSON.parse(e.options) : e.options,
        // correct_answer intentionally omitted from the client payload
      })),
    });
  } catch (err) {
    console.error('getLesson error:', err);
    res.status(500).json({ message: 'Failed to load lesson.' });
  }
}

// POST /api/lessons/:group/:id/complete  { answers: { exerciseId: answer } }
async function completeLesson(req, res) {
  try {
    const ageGroup = parseGroup(req.params.group);
    const lessonNumber = Number(req.params.id);
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    const [lessonRows] = await pool.query('SELECT * FROM lessons WHERE age_group = ? AND lesson_number = ?', [ageGroup, lessonNumber]);
    if (lessonRows.length === 0) return res.status(404).json({ message: 'Lesson not found.' });
    const lesson = lessonRows[0];

    const [userRows] = await pool.query('SELECT subscription_status FROM users WHERE id = ?', [req.user.id]);
    const userIsPaid = userRows[0] ? isPaidStatus(userRows[0].subscription_status) : false;
    if (!lesson.is_free && !userIsPaid) {
      return res.status(403).json({ message: 'This lesson requires an active subscription.' });
    }

    const [exercises] = await pool.query('SELECT id, correct_answer, explanation FROM exercises WHERE lesson_id = ?', [lesson.id]);
    let correctCount = 0;
    const results = exercises.map((ex) => {
      const submitted = answers[ex.id];
      const correct = submitted === ex.correct_answer;
      if (correct) correctCount += 1;
      return { exerciseId: ex.id, correct, explanation: ex.explanation };
    });

    const score = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
    const passed = score >= 70;

    await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, score, attempts, last_attempt_at, completed_at)
       VALUES (?, ?, ?, 1, NOW(), ?)
       ON DUPLICATE KEY UPDATE
         score = GREATEST(score, VALUES(score)),
         attempts = attempts + 1,
         last_attempt_at = NOW(),
         completed_at = IF(VALUES(completed_at) IS NOT NULL AND completed_at IS NULL, VALUES(completed_at), completed_at)`,
      [req.user.id, lesson.id, score, passed ? new Date() : null]
    );

    res.json({ score, completed: passed, results });
  } catch (err) {
    console.error('completeLesson error:', err);
    res.status(500).json({ message: 'Failed to save lesson progress.' });
  }
}

// GET /api/progress
async function myProgress(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT l.id AS lesson_id, l.age_group, l.lesson_number, l.title,
              up.score, up.attempts, up.completed_at, up.last_attempt_at
       FROM user_progress up
       JOIN lessons l ON l.id = up.lesson_id
       WHERE up.user_id = ?
       ORDER BY up.last_attempt_at DESC`,
      [req.user.id]
    );

    const completedRows = rows.filter((r) => r.completed_at);
    const totalCompleted = completedRows.length;

    // Simple day-streak: consecutive calendar days (most recent backwards) with at least one completion.
    const completionDays = [...new Set(completedRows.map((r) => new Date(r.completed_at).toDateString()))]
      .map((d) => new Date(d))
      .sort((a, b) => b - a);
    let streak = 0;
    if (completionDays.length > 0) {
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      for (const day of completionDays) {
        const diffDays = Math.round((cursor - day) / 86400000);
        if (diffDays === 0 || diffDays === 1) {
          streak += 1;
          cursor = day;
        } else {
          break;
        }
      }
    }

    res.json({
      totalCompleted,
      totalAttempted: rows.length,
      streak,
      recent: rows.slice(0, 10).map((r) => ({
        lessonId: r.lesson_id,
        ageGroup: r.age_group,
        lessonNumber: r.lesson_number,
        title: r.title,
        score: r.score,
        attempts: r.attempts,
        completed: !!r.completed_at,
        completedAt: r.completed_at,
      })),
    });
  } catch (err) {
    console.error('myProgress error:', err);
    res.status(500).json({ message: 'Failed to load progress.' });
  }
}

module.exports = { listLessons, getLesson, completeLesson, myProgress };
