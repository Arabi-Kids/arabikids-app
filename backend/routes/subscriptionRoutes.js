const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createCheckoutSession, getStatus, cancelSubscription } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/checkout', requireAuth, createCheckoutSession);
router.get('/status', requireAuth, getStatus);
router.post('/cancel', requireAuth, cancelSubscription);

module.exports = router;
