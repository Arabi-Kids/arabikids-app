const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  dashboard,
  listUsers,
  updateUser,
  listSubscriptions,
  listLessonsAdmin,
  updateLesson,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.get('/subscriptions', listSubscriptions);
router.get('/lessons', listLessonsAdmin);
router.put('/lessons/:id', updateLesson);

module.exports = router;
