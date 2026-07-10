const pool = require('../config/db');

const MONTHLY_PRICE_USD = 9.99;
const ANNUAL_PRICE_USD = 89.99;

// GET /api/admin/dashboard
async function dashboard(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "parent"');
    const [[{ monthlyCount }]] = await pool.query(
      `SELECT COUNT(*) AS monthlyCount FROM users WHERE subscription_status = 'active' AND subscription_plan = 'monthly'`
    );
    const [[{ annualCount }]] = await pool.query(
      `SELECT COUNT(*) AS annualCount FROM users WHERE subscription_status = 'active' AND subscription_plan = 'annual'`
    );
    const [[{ pastDue }]] = await pool.query(
      `SELECT COUNT(*) AS pastDue FROM users WHERE subscription_status = 'past_due'`
    );
    const [[{ totalLessons }]] = await pool.query('SELECT COUNT(*) AS totalLessons FROM lessons');
    const [[{ completedToday }]] = await pool.query(
      `SELECT COUNT(*) AS completedToday FROM user_progress WHERE DATE(completed_at) = CURDATE()`
    );
    const [recentUsers] = await pool.query(
      'SELECT id, name, email, subscription_status, created_at FROM users WHERE role = "parent" ORDER BY created_at DESC LIMIT 5'
    );

    const mrrUsd = monthlyCount * MONTHLY_PRICE_USD + annualCount * (ANNUAL_PRICE_USD / 12);

    res.json({
      totalUsers,
      paidSubscribers: monthlyCount + annualCount,
      mrrUsd: Number(mrrUsd.toFixed(2)),
      pastDueSubscriptions: pastDue,
      totalLessons,
      lessonsCompletedToday: completedToday,
      recentSignups: recentUsers,
    });
  } catch (err) {
    console.error('dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
}

// GET /api/admin/users?search=&status=
async function listUsers(req, res) {
  try {
    const { search, status } = req.query;
    const clauses = ['role = "parent"'];
    const values = [];

    if (search) {
      clauses.push('(name LIKE ? OR email LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      clauses.push('subscription_status = ?');
      values.push(status);
    }

    const [users] = await pool.query(
      `SELECT id, name, email, child_name, age_group, role, subscription_status, subscription_plan, created_at
       FROM users WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
      values
    );
    res.json({ users });
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ message: 'Failed to load users.' });
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, subscriptionStatus, subscriptionPlan } = req.body;
    const fields = [];
    const values = [];

    if (role) {
      if (!['parent', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
      fields.push('role = ?');
      values.push(role);
    }
    if (subscriptionStatus) {
      if (!['free', 'active', 'past_due', 'canceled'].includes(subscriptionStatus)) {
        return res.status(400).json({ message: 'Invalid subscription status.' });
      }
      fields.push('subscription_status = ?');
      values.push(subscriptionStatus);
    }
    if (subscriptionPlan !== undefined) {
      if (subscriptionPlan !== null && !['monthly', 'annual'].includes(subscriptionPlan)) {
        return res.status(400).json({ message: 'Invalid subscription plan.' });
      }
      fields.push('subscription_plan = ?');
      values.push(subscriptionPlan);
    }
    if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update.' });

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'User updated.' });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
}

// GET /api/admin/subscriptions
async function listSubscriptions(req, res) {
  try {
    const [subs] = await pool.query(
      `SELECT id, name, email, subscription_status, subscription_plan, stripe_customer_id,
              stripe_subscription_id, current_period_end
       FROM users WHERE subscription_status != 'free' ORDER BY current_period_end DESC`
    );
    res.json({ subscriptions: subs });
  } catch (err) {
    console.error('listSubscriptions error:', err);
    res.status(500).json({ message: 'Failed to load subscriptions.' });
  }
}

// GET /api/admin/lessons
async function listLessonsAdmin(req, res) {
  try {
    const [lessons] = await pool.query(
      `SELECT id, age_group, lesson_number, title, lesson_goal, arabic_word, arabic_word_meaning, is_free, estimated_minutes
       FROM lessons ORDER BY age_group, lesson_number`
    );
    res.json({ lessons });
  } catch (err) {
    console.error('listLessonsAdmin error:', err);
    res.status(500).json({ message: 'Failed to load lessons.' });
  }
}

// PUT /api/admin/lessons/:id
async function updateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, content, isFree } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      fields.push('content = ?');
      values.push(JSON.stringify(content));
    }
    if (isFree !== undefined) {
      fields.push('is_free = ?');
      values.push(isFree ? 1 : 0);
    }
    if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update.' });

    values.push(id);
    await pool.query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Lesson updated.' });
  } catch (err) {
    console.error('updateLesson error:', err);
    res.status(500).json({ message: 'Failed to update lesson.' });
  }
}

module.exports = { dashboard, listUsers, updateUser, listSubscriptions, listLessonsAdmin, updateLesson };
