import { supabaseAffiliate } from './supabaseAffiliate.js';

// All queries here rely on RLS (affiliates can only ever see their own rows,
// see supabase/add_affiliate_program.sql) - explicit .eq('affiliate_id', ...)
// filters are added anyway where practical, purely for clearer query plans,
// not for correctness.

function tierRateFor(activeCount) {
  if (activeCount >= 30) return 0.2;
  if (activeCount >= 10) return 0.15;
  return 0.1;
}

export async function getMyProfile() {
  const {
    data: { user },
  } = await supabaseAffiliate.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data, error } = await supabaseAffiliate.from('affiliates').select('*').eq('auth_user_id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyReferralStats(affiliateId) {
  const { data, error } = await supabaseAffiliate.from('referrals').select('status').eq('affiliate_id', affiliateId);
  if (error) throw new Error(error.message);
  const active = data.filter((r) => r.status === 'active').length;
  const pending = data.filter((r) => r.status === 'pending').length;
  const expired = data.filter((r) => r.status === 'expired').length;
  return { active, pending, expired, currentTierRate: tierRateFor(active) };
}

// No customer name/email at all - stronger than the admin audit view's
// masking, matching the spec's "no sensitive customer data" requirement.
export async function listMyReferrals(affiliateId) {
  const { data, error } = await supabaseAffiliate
    .from('referrals')
    .select('id, status, commission_tier_at_signup, commission_start_date, cap_expires_at, created_at')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const now = new Date();
  return data.map((r) => ({
    ...r,
    monthsRemaining:
      r.status === 'active' && r.cap_expires_at
        ? Math.max(0, Math.ceil((new Date(r.cap_expires_at) - now) / (1000 * 60 * 60 * 24 * 30)))
        : null,
  }));
}

export async function getMyCommissionSummary(affiliateId) {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const { data: currentMonthEvents, error: eventsError } = await supabaseAffiliate
    .from('commission_events')
    .select('commission_amount_cents')
    .eq('affiliate_id', affiliateId)
    .gte('invoice_paid_at', monthStart.toISOString());
  if (eventsError) throw new Error(eventsError.message);
  const currentMonthCents = currentMonthEvents.reduce((sum, e) => sum + e.commission_amount_cents, 0);

  const { data: payouts, error: payoutsError } = await supabaseAffiliate
    .from('affiliate_payouts')
    .select('amount_cents')
    .eq('affiliate_id', affiliateId);
  if (payoutsError) throw new Error(payoutsError.message);
  const lifetimeCents = currentMonthCents + payouts.reduce((sum, p) => sum + p.amount_cents, 0);

  return { currentMonthCents, lifetimeCents };
}

export async function getMyPayoutHistory(affiliateId) {
  const { data, error } = await supabaseAffiliate
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('period_month', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
