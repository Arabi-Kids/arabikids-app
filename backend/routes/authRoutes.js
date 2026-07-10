const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { register, login, me, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
