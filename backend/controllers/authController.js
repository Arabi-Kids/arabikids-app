const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { addSubscriber, sendWelcomeEmail } = require('../utils/enginemailer');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    childName: user.child_name,
    ageGroup: user.age_group,
    role: user.role,
    subscriptionStatus: user.subscription_status,
    subscriptionPlan: user.subscription_plan,
  };
}

async function register(req, res) {
  try {
    const { name, email, password, childName, ageGroup } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, child_name, age_group) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashed, childName || null, ageGroup || 'junior']
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];

    addSubscriber({ email, name }).catch((e) => console.error('addSubscriber failed:', e.message));
    sendWelcomeEmail({ email, name }).catch((e) => console.error('sendWelcomeEmail failed:', e.message));

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Something went wrong while creating your account.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    // Always respond with success to avoid leaking which emails are registered.
    if (rows.length === 0) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [
      resetToken,
      expires,
      user.id,
    ]);

    // In production this would email a reset link containing resetToken via Enginemailer.
    console.log(`Password reset requested for ${email}. Token: ${resetToken}`);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, rows[0].id]
    );

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

module.exports = { register, login, me, forgotPassword, resetPassword };
