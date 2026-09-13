const { getServiceClient } = require('./_lib');

// Scheduled Netlify Function (see `config.schedule` below) - runs on the 1st
// of each month and closes out the PRIOR full calendar month's affiliate
// commissions. Not callable over HTTP in any meaningful way - Netlify
// invokes this on its own via the cron schedule, not from the frontend.
//
// Two responsibilities:
// 1. Safety-net cap sweep: flip any referral still 'active' whose cap has
//    already passed to 'expired'. The normal path already does this inline
//    in stripe-webhook.js's invoice.paid handler - this only catches a
//    referral whose customer simply stopped generating invoices near the
//    cap, so it would otherwise sit at 'active' with a stale, past
//    cap_expires_at forever.
// 2. Aggregate: sum commission_events per affiliate for the prior month and
//    upsert one affiliate_payouts row each, via upsert_affiliate_payout()
//    (a Postgres function, not a plain client upsert) so a re-run never
//    overwrites a payout already marked 'sent'. commission_events is the
//    trusted source of truth (only ever written by the webhook's own
//    cap-checked, idempotent insert), so this aggregation needs no cap
//    logic of its own - it just sums what's already correct.

exports.handler = async () => {
  const supabase = getServiceClient();
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
  if (!events.length) return { statusCode: 200, body: 'no commission events for prior month' };

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

  return { statusCode: 200, body: `computed payouts for ${processed} affiliate(s)` };
};

// 1st of the month at 03:00 UTC - the prior month is fully closed by then.
exports.config = { schedule: '0 3 1 * *' };
