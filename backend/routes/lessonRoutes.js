const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { listLessons, getLesson, completeLesson } = require('../controllers/lessonController');

const router = express.Router();

router.get('/:group', optionalAuth, listLessons);
router.get('/:group/:id', optionalAuth, getLesson);
router.post('/:group/:id/complete', requireAuth, completeLesson);

module.exports = router;
