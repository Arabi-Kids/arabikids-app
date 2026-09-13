// First-touch affiliate referral capture - captured once per browser (never
// overwritten by a later visit), mirroring lib/attribution.js's exact
// pattern. Read by AuthContext.register() and saved to
// users.referral_code_used once, at signup time only - see
// supabase/add_affiliate_program.sql. The webhook resolves the actual
// affiliate from that column later, at first successful payment - nothing
// here ever touches Stripe (see stripe-webhook.js for why: Payment Links
// can't carry custom metadata, so the referral is associated entirely on
// the Supabase side before checkout even starts).
const STORAGE_KEY = 'ak_referral';

/** Call once at app boot. No-ops if a referral code was already captured, or
 * if this visit has no ?ref= param. */
export function captureReferral() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) localStorage.setItem(STORAGE_KEY, ref);
}

export function getReferral() {
  return localStorage.getItem(STORAGE_KEY);
}
