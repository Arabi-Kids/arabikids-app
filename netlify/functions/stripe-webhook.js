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

// Affiliate referral: Stripe Payment Links can't carry custom metadata (only
// client_reference_id/prefilled_email as URL params, and client_reference_id
// is already committed to the Supabase user id), so the referral is
// associated entirely on the Supabase side before checkout even happens -
// see frontend/src/lib/referral.js and AuthContext.jsx's register(). This
// just resolves that pre-existing association into a `referrals` row, once,
// the first time this customer's checkout completes. Deliberately does NOT
// create a commission_events row here - that only happens on an actual
// `invoice.paid` (see below), which is what "never on trial signups" means
// in practice: a referral that never converts stays 'pending' forever.
async function createReferralIfNeeded(supabase, customerId) {
  const { data: customerRow } = await supabase.from('users').select('id, referral_code_used').eq('id', customerId).maybeSingle();
  if (!customerRow?.referral_code_used) return;

  const { data: existingReferral } = await supabase.from('referrals').select('id').eq('customer_id', customerId).maybeSingle();
  if (existingReferral) return;

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, status')
    .eq('referral_code', customerRow.referral_code_used)
    .maybeSingle();
  if (!affiliate || affiliate.status !== 'active') return;

  // Tier is the affiliate's CURRENT active-referral count at the moment this
  // new referral is created - "forward-only": existing referrals already
  // have their own frozen rate and are never touched by this.
  const { count: activeReferralCount } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', affiliate.id)
    .eq('status', 'active');

  const tierRate = activeReferralCount >= 30 ? 0.2 : activeReferralCount >= 10 ? 0.15 : 0.1;

  await supabase.from('referrals').insert({
    affiliate_id: affiliate.id,
    customer_id: customerId,
    commission_tier_at_signup: tierRate,
    status: 'pending',
  });
}

// Commission on an actual successful payment - the only trigger the business
// rules allow (never trial signups, never failed/refunded payments). Cap
// enforcement happens here, inline, on every invoice: the first invoice
// whose paid-at is at/past a referral's cap_expires_at gets no commission
// and permanently expires the referral. Idempotent via the stripe_invoice_id
// unique constraint - a 23505 conflict means Stripe redelivered an event we
// already processed, not an error.
async function recordCommissionForInvoice(supabase, invoice, eventCreatedAt) {
  if (!invoice.subscription || !invoice.amount_paid || invoice.amount_paid <= 0) return;

  const { data: userRow } = await supabase.from('users').select('id').eq('stripe_subscription_id', invoice.subscription).maybeSingle();
  if (!userRow) return;

  const { data: referral } = await supabase.from('referrals').select('*').eq('customer_id', userRow.id).maybeSingle();
  if (!referral || referral.status === 'expired') return;

  const paidAt = new Date(invoice.status_transitions?.paid_at ? invoice.status_transitions.paid_at * 1000 : eventCreatedAt);

  let effectiveReferral = referral;
  if (referral.status === 'pending') {
    // First-ever qualifying payment for this referral: activate it and start
    // its 24-month cap clock from this exact payment date.
    const capExpiresAt = new Date(paidAt);
    capExpiresAt.setMonth(capExpiresAt.getMonth() + 24);
    const { data: updated } = await supabase
      .from('referrals')
      .update({ status: 'active', commission_start_date: paidAt.toISOString(), cap_expires_at: capExpiresAt.toISOString() })
      .eq('id', referral.id)
      .select()
      .single();
    effectiveReferral = updated || effectiveReferral;
  }

  if (effectiveReferral.cap_expires_at && new Date(effectiveReferral.cap_expires_at) <= paidAt) {
    await supabase.from('referrals').update({ status: 'expired' }).eq('id', effectiveReferral.id);
    return;
  }

  const commissionAmountCents = Math.round(invoice.amount_paid * effectiveReferral.commission_tier_at_signup);
  const { error: insertError } = await supabase.from('commission_events').insert({
    referral_id: effectiveReferral.id,
    affiliate_id: effectiveReferral.affiliate_id,
    stripe_invoice_id: invoice.id,
    amount_paid_cents: invoice.amount_paid,
    commission_rate_applied: effectiveReferral.commission_tier_at_signup,
    commission_amount_cents: commissionAmountCents,
    invoice_paid_at: paidAt.toISOString(),
  });
  if (insertError && insertError.code !== '23505') throw new Error(insertError.message);
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
          let subscription = await stripe.subscriptions.retrieve(session.subscription);
          // Subscriptions started from a Stripe-Dashboard Payment Link (rather
          // than a Checkout Session we created ourselves) never get a userId
          // in their metadata automatically - backfill it here from
          // client_reference_id (the app appends this as a URL param when
          // linking to the Payment Link) and from the Payment Link's own
          // metadata (plan/tier, set once per link in the Dashboard, which
          // Stripe copies onto session.metadata). Once written back onto the
          // subscription itself, every later event (renewal, cancellation,
          // etc.) keeps resolving the same way via subscription.metadata.
          if (!subscription.metadata?.userId && session.client_reference_id) {
            subscription = await stripe.subscriptions.update(subscription.id, {
              metadata: {
                userId: session.client_reference_id,
                plan: session.metadata?.plan || '',
                tier: session.metadata?.tier || 'standard',
              },
            });
          }
          const result = await updateUserFromSubscription(supabase, subscription, eventCreatedAt);
          if (result) {
            notifyAdmin(
              '🎉 New ArabiKids Subscriber',
              `<p><strong>${result.email}</strong> just subscribed to the <strong>${result.tier}</strong> plan (${result.plan}).</p>`
            );
          }
          // Independent of the staleness check above (which only guards
          // subscription-status writes) - referral attribution keys off
          // client_reference_id directly, once, the first time this
          // customer's checkout completes.
          if (session.client_reference_id) {
            await createReferralIfNeeded(supabase, session.client_reference_id);
          }
        }
        break;
      }
      case 'invoice.paid': {
        await recordCommissionForInvoice(supabase, stripeEvent.data.object, eventCreatedAt);
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
