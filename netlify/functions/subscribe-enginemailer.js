const { json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/subscribe-enginemailer  { name, email, ageGroup }
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
const API_KEY = process.env.ENGINEMAILER_API_KEY;
const SUBCATEGORY_ID = process.env.ENGINEMAILER_LIST_ID;
const FRONTEND_URL = process.env.FRONTEND_URL;
const INSERT_URL = 'https://api.enginemailer.com/restapi/subscriber/emsubscriber/insertSubscriber';

async function addToSubscriberList(email) {
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
}

function welcomeEmailHtml(name, ageGroup) {
  const group = ageGroup === 'explorer' ? 'Explorer' : 'Junior';
  return emailLayout({
    title: `Welcome to ArabiKids${name ? `, ${name}` : ''}!`,
    bodyHtml: `
      <p>Your account is ready, and your child's first 5 <strong>${group}</strong> lessons are unlocked right now — no credit card needed.</p>
      <p>Every lesson connects an Arabic word directly to the Quran, so what they learn to say, they also learn to understand.</p>
    `,
    ctaText: 'Start Your First Lesson',
    ctaUrl: `${FRONTEND_URL}/lessons/${ageGroup === 'explorer' ? 'explorer' : 'junior'}`,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping subscribe-enginemailer.');
    return json(200, { skipped: true });
  }

  let name, email, ageGroup;
  try {
    ({ name, email, ageGroup } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  const result = { subscribed: false, welcomeEmailSent: false };

  try {
    await addToSubscriberList(email);
    result.subscribed = true;
  } catch (err) {
    // Non-fatal — signup already succeeded via Supabase Auth before this is called.
    console.error('subscribe-enginemailer (list add) error:', err);
  }

  try {
    const sendResult = await sendTransactionalEmail({
      toEmail: email,
      subject: 'Welcome to ArabiKids 🎉',
      html: welcomeEmailHtml(name, ageGroup),
      campaignName: 'ArabiKids Welcome Email',
    });
    result.welcomeEmailSent = sendResult.sent;
  } catch (err) {
    console.error('subscribe-enginemailer (welcome email) error:', err);
  }

  return json(200, result);
};
