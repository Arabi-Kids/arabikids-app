const { getServiceClient, getStripe } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@arabikids.online';

function notifyAdmin(title, bodyHtml) {
  // Fire-and-forget - a failed admin notification must never affect webhook
  // processing (Stripe retries on non-2xx responses; retrying only because
  // an FYI email didn't send would just reprocess the same event pointlessly).
  const html = emailLayout({ title, bodyHtml });
  sendTransactionalEmail({ toEmail: ADMIN_EMAIL, subject: title, html, campaignName: 'ArabiKids Admin Alert' }).catch((err) =>
    console.error('notifyAdmin failed:', err.message)
  );
}

function mapStripeStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due';
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired') return 'canceled';
  return 'free';
}

// Applies a subscription update only if this event is newer than the last one
// we applied for the affected user — protects against Stripe redelivering
// webhooks out of order and clobbering a newer state with a stale one.
async function updateUserFromSubscription(supabase, subscription, eventCreatedAt) {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan || null;
  const tier = subscription.metadata?.tier || 'standard';
  const status = mapStripeStatus(subscription.status);
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;

  const filter = userId ? { column: 'id', value: userId } : { column: 'stripe_subscription_id', value: subscription.id };

  const { data: current } = await supabase.from('users').select('id, email, stripe_last_event_at').eq(filter.column, filter.value).maybeSingle();
  if (!current) return null;
  if (current.stripe_last_event_at && new Date(current.stripe_last_event_at) >= eventCreatedAt) {
    return null; // stale/out-of-order event, ignore
  }

  await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_plan: plan,
      subscription_tier: tier,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd,
      stripe_last_event_at: eventCreatedAt.toISOString(),
    })
    .eq('id', current.id);

  return { email: current.email, plan, tier };
}

async function markStatus(supabase, subscriptionId, status, eventCreatedAt) {
  const { data: current } = await supabase
    .from('users')
    .select('id, email, stripe_last_event_at')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();
  if (!current) return null;
  if (current.stripe_last_event_at && new Date(current.stripe_last_event_at) >= eventCreatedAt) return null;

  await supabase
    .from('users')
    .update({ subscription_status: status, stripe_last_event_at: eventCreatedAt.toISOString() })
    .eq('id', current.id);

  return { email: current.email };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed.' };

  const stripe = getStripe();
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = getServiceClient();
  const eventCreatedAt = new Date(stripeEvent.created * 1000);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const result = await updateUserFromSubscription(supabase, subscription, eventCreatedAt);
          if (result) {
            notifyAdmin(
              '🎉 New ArabiKids Subscriber',
              `<p><strong>${result.email}</strong> just subscribed to the <strong>${result.tier}</strong> plan (${result.plan}).</p>`
            );
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        await updateUserFromSubscription(supabase, stripeEvent.data.object, eventCreatedAt);
        break;
      }
      case 'customer.subscription.deleted': {
        const result = await markStatus(supabase, stripeEvent.data.object.id, 'canceled', eventCreatedAt);
        if (result) {
          notifyAdmin('ArabiKids Subscription Canceled', `<p><strong>${result.email}</strong> just canceled their subscription.</p>`);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        if (invoice.subscription) {
          const result = await markStatus(supabase, invoice.subscription, 'past_due', eventCreatedAt);
          if (result) {
            notifyAdmin(
              '⚠️ ArabiKids Payment Failed',
              `<p>A payment for <strong>${result.email}</strong> failed. Their account has been marked past-due.</p>`
            );
          }
        }
        break;
      }
      default:
        break;
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('stripe-webhook processing error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Webhook handler failed.' }) };
  }
};
