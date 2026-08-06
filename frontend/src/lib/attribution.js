// First-touch acquisition attribution - captured once per browser (never
// overwritten by a later visit) so a signup days after the first ad click
// still gets credited to that original click, not whatever page they
// happened to land on right before registering. Read by
// AuthContext.register() and saved to users.signup_source once, at signup
// time only - see supabase/add_signup_source.sql.
const STORAGE_KEY = 'ak_attribution';

/** Call once at app boot. No-ops if attribution was already captured, or if
 * this visit has no useful signal (direct visit, no UTM params). */
export function captureAttribution() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const data = {
    referrer: document.referrer || null,
    landingPath: window.location.pathname + window.location.search,
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    gclid: params.get('gclid'),
    capturedAt: new Date().toISOString(),
  };

  const hasSignal = data.referrer || data.utmSource || data.utmMedium || data.utmCampaign || data.gclid;
  if (hasSignal) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAttribution() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
