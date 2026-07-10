require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { handleWebhook } = require('./controllers/subscriptionController');
const { myProgress } = require('./controllers/lessonController');
const { requireAuth } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Stripe requires the raw request body to verify webhook signatures,
// so this route must be registered before the global express.json() parser.
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.get('/api/progress', requireAuth, myProgress);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found.' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ArabiKids API listening on port ${PORT}`));
