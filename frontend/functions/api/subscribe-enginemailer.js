import { json } from '../_shared/lib.js';

// POST /api/subscribe-enginemailer  { email }
// Called (fire-and-forget) right after a successful signup. Not auth-gated:
// it only ever adds the caller's own just-submitted email, nothing privileged.
//
// NOTE: the endpoint/field shape here is verified against Enginemailer's real
// docs (enginemailer.zendesk.com/hc/en-us/articles/360000736852-Insert-Subscriber),
// confirmed working against the live account.
//
// Enginemailer has no "list"; subscribers are tagged with one or more
// numeric "sub category" ids (see GetSubCategory). ENGINEMAILER_LIST_ID here
// holds that sub-category id — "1" ("Default") for this account.
//
// Welcome messaging is handled separately, via Supabase's own "Confirm
// signup" email (see supabase/email-templates/confirm-signup.html) — no
// verified sending domain in Enginemailer yet. This function only adds to
// the marketing list.
const INSERT_URL = 'https://api.enginemailer.com/restapi/subscriber/emsubscriber/insertSubscriber';

export async function onRequestPost({ request, env }) {
  const API_KEY = env.ENGINEMAILER_API_KEY;
  const SUBCATEGORY_ID = env.ENGINEMAILER_LIST_ID;

  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping subscribe-enginemailer.');
    return json(200, { skipped: true });
  }

  let email;
  try {
    ({ email } = JSON.parse((await request.text()) || '{}'));
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
}
