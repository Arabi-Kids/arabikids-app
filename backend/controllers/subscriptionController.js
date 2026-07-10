const pool = require('../config/db');
const { stripe, PRICE_IDS } = require('../utils/stripe');

// POST /api/subscriptions/checkout  { plan: 'monthly' | 'annual' }
async function createCheckoutSession(req, res) {
  try {
    const { plan } = req.body;
    if (!['monthly', 'annual'].includes(plan)) {
      return res.status(400).json({ message: 'Plan must be "monthly" or "annual".' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      await pool.query('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, user.id]);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/account?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?checkout=cancelled`,
      metadata: { userId: String(user.id), plan },
      subscription_data: { metadata: { userId: String(user.id), plan } },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    res.status(500).json({ message: 'Failed to start checkout.' });
  }
}

// GET /api/subscriptions/status
async function getStatus(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT subscription_status, subscription_plan, current_period_end FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    const u = rows[0];
    res.json({
      status: u.subscription_status,
      plan: u.subscription_plan,
      currentPeriodEnd: u.current_period_end,
    });
  } catch (err) {
    console.error('getStatus error:', err);
    res.status(500).json({ message: 'Failed to load subscription status.' });
  }
}

// POST /api/subscriptions/cancel - cancels at the end of the current billing period
async function cancelSubscription(req, res) {
  try {
    const [rows] = await pool.query('SELECT stripe_subscription_id FROM users WHERE id = ?', [req.user.id]);
    const subscriptionId = rows[0]?.stripe_subscription_id;
    if (!subscriptionId) return res.status(400).json({ message: 'No active subscription found.' });

    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    res.json({ message: 'Your subscription will be canceled at the end of the current billing period.' });
  } catch (err) {
    console.error('cancelSubscription error:', err);
    res.status(500).json({ message: 'Failed to cancel subscription.' });
  }
}

async function updateUserFromSubscription(subscription) {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan || null;
  const status = mapStripeStatus(subscription.status);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  if (userId) {
    await pool.query(
      `UPDATE users SET subscription_status = ?, subscription_plan = ?, stripe_subscription_id = ?, current_period_end = ? WHERE id = ?`,
      [status, plan, subscription.id, periodEnd, userId]
    );
  } else {
    await pool.query(
      `UPDATE users SET subscription_status = ?, subscription_plan = ?, current_period_end = ? WHERE stripe_subscription_id = ?`,
      [status, plan, periodEnd, subscription.id]
    );
  }
}

function mapStripeStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due';
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired') return 'canceled';
  return 'free';
}

// POST /api/subscriptions/webhook - raw body required (configured in server.js)
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await updateUserFromSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        await updateUserFromSubscription(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await pool.query(
          `UPDATE users SET subscription_status = 'canceled' WHERE stripe_subscription_id = ?`,
          [subscription.id]
        );
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await pool.query(
            `UPDATE users SET subscription_status = 'past_due' WHERE stripe_subscription_id = ?`,
            [invoice.subscription]
          );
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('handleWebhook processing error:', err);
    res.status(500).json({ message: 'Webhook handler failed.' });
  }
}

module.exports = { createCheckoutSession, getStatus, cancelSubscription, handleWebhook };
