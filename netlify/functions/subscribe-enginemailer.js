const { json } = require('./_lib');

// POST /api/subscribe-enginemailer  { email }
// Called (fire-and-forget) right after a successful signup. Not auth-gated:
// it only ever adds the caller's own just-submitted email, nothing privileged.
//
// NOTE: the endpoint/field shape here is verified against Enginemailer's real
// docs (enginemailer.zendesk.com/hc/en-us/articles/360000736852-Insert-Subscriber),
// confirmed working against the live account. The original code this replaced
// (ported from backend/utils/enginemailer.js) called a fictional
// "/Subscriber/Add" endpoint with a { ListId, Email, Fields } shape that
// doesn't exist in Enginemailer's actual API — it always 404'd.
//
// Enginemailer has no "list"; subscribers are tagged with one or more
// numeric "sub category" ids (see GetSubCategory). ENGINEMAILER_LIST_ID here
// holds that sub-category id — "1" ("Default") for this account.
//
// Welcome messaging is handled separately, via Supabase's own "Confirm
// signup" email (see supabase/email-templates/confirm-signup.html) — no
// verified sending domain in Enginemailer yet. This function only adds to
// the marketing list. If you later want Enginemailer to also send a welcome
// email once a domain is verified, use _enginemailer.js's
// sendTransactionalEmail/emailLayout helpers here — but don't add it back
// without turning off the Supabase-side welcome messaging, or new users get
// two welcome emails.
const API_KEY = process.env.ENGINEMAILER_API_KEY;
const SUBCATEGORY_ID = process.env.ENGINEMAILER_LIST_ID;
const INSERT_URL = 'https://api.enginemailer.com/restapi/subscriber/emsubscriber/insertSubscriber';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping subscribe-enginemailer.');
    return json(200, { skipped: true });
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  try {
    const res = await fetch(INSERT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', APIKey: API_KEY },
      body: JSON.stringify({
        email,
        subcategories: SUBCATEGORY_ID ? [Number(SUBCATEGORY_ID)] : [],
        sourcetype: 'ArabiKids Signup',
      }),
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok && data?.Result?.Status === 'OK';
    if (!ok) throw new Error(`Enginemailer InsertSubscriber error: ${JSON.stringify(data)}`);
    return json(200, { subscribed: true });
  } catch (err) {
    // Non-fatal — signup already succeeded via Supabase Auth before this is called.
    console.error('subscribe-enginemailer error:', err);
    return json(200, { subscribed: false });
  }
};
