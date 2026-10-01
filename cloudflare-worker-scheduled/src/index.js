import { buildPushHTTPRequest } from '@pushforge/builder';
import { getServiceClient } from './lib.js';

// Two Cron Triggers (see wrangler.toml), dispatched here by event.cron.
// Ported 1:1 from Netlify's Scheduled Functions - same logic, only the
// outer shell (scheduled() instead of exports.handler, env instead of
// process.env) and the push-sending library differ (see
// sendStreakReminders()'s comment for why).

const STREAK_CRON = '0 17 * * *';
const COMMISSIONS_CRON = '0 3 1 * *';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Daily at 17:00 UTC - a reasonable "evening reminder" across most western
// timezones; adjust to taste once real usage data shows a better time.
// Pushes a "keep your streak!" notification to any child with an active
// streak who hasn't completed a lesson yet today (UTC day boundary,
// matching computeStreak() in frontend/src/lib/db.js).
async function sendStreakReminders(env) {
  if (!env.VAPID_PRIVATE_KEY_JWK) {
    console.warn('send-streak-reminders: VAPID key not configured, skipping run.');
    return 'skipped: not configured';
  }
  const privateJWK = JSON.parse(env.VAPID_PRIVATE_KEY_JWK);
  const adminContact = env.VAPID_SUBJECT || 'mailto:hello@arabikids.online';

  const supabase = getServiceClient(env);

  const { data: streakChildren, error: childrenError } = await supabase
    .from('child_profiles')
    .select('id, name')
    .gt('current_streak', 0);
  if (childrenError) throw new Error(childrenError.message);
  if (!streakChildren.length) return 'no children with an active streak';

  const childIds = streakChildren.map((c) => c.id);
  const { data: progressRows, error: progressError } = await supabase
    .from('child_lesson_progress')
    .select('child_id, completed_at')
    .in('child_id', childIds)
    .not('completed_at', 'is', null);
  if (progressError) throw new Error(progressError.message);

  const lastCompletedByChild = new Map();
  for (const row of progressRows) {
    const prev = lastCompletedByChild.get(row.child_id);
    if (!prev || row.completed_at > prev) lastCompletedByChild.set(row.child_id, row.completed_at);
  }

  const today = todayUtc();
  const atRiskChildren = streakChildren.filter((c) => {
    const last = lastCompletedByChild.get(c.id);
    return !last || last.slice(0, 10) !== today;
  });
  if (!atRiskChildren.length) return 'everyone already learned today';

  const atRiskIds = atRiskChildren.map((c) => c.id);
  const { data: subscriptions, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('id, child_id, endpoint, p256dh, auth')
    .in('child_id', atRiskIds);
  if (subsError) throw new Error(subsError.message);

  const nameByChildId = new Map(atRiskChildren.map((c) => [c.id, c.name]));
  const staleSubscriptionIds = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      const payload = {
        title: 'ArabiKids',
        body: `${nameByChildId.get(sub.child_id)} hasn't practiced today - keep the streak alive!`,
        url: '/lessons',
      };
      try {
        const { endpoint, headers, body } = await buildPushHTTPRequest({
          privateJWK,
          subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message: { payload, adminContact },
        });
        const res = await fetch(endpoint, { method: 'POST', headers, body });
        if (res.ok) {
          sent += 1;
        } else if (res.status === 404 || res.status === 410) {
          // Browser unsubscribed or the subscription expired - clean it up
          // so future runs don't keep retrying a dead endpoint.
          staleSubscriptionIds.push(sub.id);
        } else {
          console.error('send-streak-reminders: push failed for', sub.id, res.status);
        }
      } catch (err) {
        console.error('send-streak-reminders: push failed for', sub.id, err.message);
      }
    })
  );

  if (staleSubscriptionIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleSubscriptionIds);
  }

  return `sent ${sent}, pruned ${staleSubscriptionIds.length} stale subscriptions`;
}

// 1st of the month at 03:00 UTC - closes out the PRIOR full calendar
// month's affiliate commissions. Two responsibilities:
// 1. Safety-net cap sweep: flip any referral still 'active' whose cap has
//    already passed to 'expired'. The normal path already does this inline
//    in the stripe-webhook Pages Function's invoice.paid handler - this
//    only catches a referral whose customer simply stopped generating
//    invoices near the cap.
// 2. Aggregate: sum commission_events per affiliate for the prior month and
//    upsert one affiliate_payouts row each, via upsert_affiliate_payout()
//    (a Postgres function, not a plain client upsert) so a re-run never
//    overwrites a payout already marked 'sent'.
async function computeAffiliateCommissions(env) {
  const supabase = getServiceClient(env);
  const now = new Date();

  const { error: expireError } = await supabase
    .from('referrals')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('cap_expires_at', now.toISOString());
  if (expireError) throw new Error(expireError.message);

  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const { data: events, error: eventsError } = await supabase
    .from('commission_events')
    .select('affiliate_id, commission_amount_cents')
    .gte('invoice_paid_at', periodStart.toISOString())
    .lt('invoice_paid_at', periodEnd.toISOString());
  if (eventsError) throw new Error(eventsError.message);
  if (!events.length) return 'no commission events for prior month';

  const totalsByAffiliate = new Map();
  for (const e of events) {
    totalsByAffiliate.set(e.affiliate_id, (totalsByAffiliate.get(e.affiliate_id) || 0) + e.commission_amount_cents);
  }

  const periodDate = periodStart.toISOString().slice(0, 10);
  let processed = 0;
  for (const [affiliateId, amountCents] of totalsByAffiliate) {
    const { error: upsertError } = await supabase.rpc('upsert_affiliate_payout', {
      p_affiliate_id: affiliateId,
      p_period: periodDate,
      p_amount_cents: amountCents,
    });
    if (upsertError) throw new Error(upsertError.message);
    processed += 1;
  }

  return `computed payouts for ${processed} affiliate(s)`;
}

export default {
  async scheduled(event, env, ctx) {
    if (event.cron === STREAK_CRON) {
      ctx.waitUntil(sendStreakReminders(env).then((msg) => console.log('send-streak-reminders:', msg)));
    } else if (event.cron === COMMISSIONS_CRON) {
      ctx.waitUntil(computeAffiliateCommissions(env).then((msg) => console.log('compute-affiliate-commissions:', msg)));
    } else {
      console.warn('scheduled(): unrecognized cron expression', event.cron);
    }
  },

  // Allows manually triggering either job for testing (e.g. `curl
  // https://arabikids-scheduled.<subdomain>.workers.dev/?job=streak`) -
  // Workers deployed with cron triggers still respond to normal HTTP
  // requests unless routes are restricted, so this is a convenient,
  // zero-extra-infra way to smoke-test both jobs on demand without waiting
  // for the real schedule or faking a CF-Cron request.
  async fetch(request, env) {
    const job = new URL(request.url).searchParams.get('job');
    try {
      if (job === 'streak') return new Response(await sendStreakReminders(env));
      if (job === 'commissions') return new Response(await computeAffiliateCommissions(env));
      return new Response('Usage: ?job=streak or ?job=commissions', { status: 400 });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};
