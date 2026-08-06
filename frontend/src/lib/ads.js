// Google Ads conversion tracking - entirely a no-op until VITE_GOOGLE_ADS_ID
// (and the matching per-action label) are set, so it's safe to call from
// anywhere regardless of whether the Ads account is wired up yet. The base
// gtag.js tag is only injected lazily, the first time a real conversion
// fires - not on every page load - since nothing needs it until then.
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const LABELS = {
  signup: import.meta.env.VITE_GOOGLE_ADS_LABEL_SIGNUP,
  purchase: import.meta.env.VITE_GOOGLE_ADS_LABEL_PURCHASE,
};

let gtagLoaded = false;

function ensureGtagLoaded() {
  if (gtagLoaded) return;
  gtagLoaded = true;
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  script.async = true;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ADS_ID);
}

/** Fires a Google Ads conversion event. `action` is 'signup' or 'purchase' -
 * no-ops silently if that action's label (or the Ads ID) isn't configured. */
export function fireConversion(action) {
  const label = LABELS[action];
  if (!ADS_ID || !label) return;
  ensureGtagLoaded();
  window.gtag('event', 'conversion', { send_to: `${ADS_ID}/${label}` });
}
