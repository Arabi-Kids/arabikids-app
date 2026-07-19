const { getServiceClient, getStripe } = require('./_lib');

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

  const { data: current } = await supabase.from('users').select('id, stripe_last_event_at').eq(filter.column, filter.value).maybeSingle();
  if (!current) return;
  if (current.stripe_last_event_at && new Date(current.stripe_last_event_at) >= eventCreatedAt) {
    return; // stale/out-of-order event, ignore
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
}

async function markStatus(supabase, subscriptionId, status, eventCreatedAt) {
  const { data: current } = await supabase
    .from('users')
    .select('id, stripe_last_event_at')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();
  if (!current) return;
  if (current.stripe_last_event_at && new Date(current.stripe_last_event_at) >= eventCreatedAt) return;

  await supabase
    .from('users')
    .update({ subscription_status: status, stripe_last_event_at: eventCreatedAt.toISOString() })
    .eq('id', current.id);
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
          await updateUserFromSubscription(supabase, subscription, eventCreatedAt);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        await updateUserFromSubscription(supabase, stripeEvent.data.object, eventCreatedAt);
        break;
      }
      case 'customer.subscription.deleted': {
        await markStatus(supabase, stripeEvent.data.object.id, 'canceled', eventCreatedAt);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        if (invoice.subscription) await markStatus(supabase, invoice.subscription, 'past_due', eventCreatedAt);
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
