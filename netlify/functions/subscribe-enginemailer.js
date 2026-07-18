const { json } = require('./_lib');

// POST /api/subscribe-enginemailer  { name, email }
// Called (fire-and-forget) right after a successful signup. Ported from the
// old backend/utils/enginemailer.js — thin wrapper around Enginemailer's REST
// API v3.5. Not auth-gated: it only ever adds the caller's own just-submitted
// name/email to the marketing list, nothing privileged.
const API_URL = process.env.ENGINEMAILER_API_URL;
const API_KEY = process.env.ENGINEMAILER_API_KEY;
const LIST_ID = process.env.ENGINEMAILER_LIST_ID;
const WELCOME_TEMPLATE_ID = process.env.ENGINEMAILER_WELCOME_TEMPLATE_ID;

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ApiKey: API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Enginemailer error (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping subscribe-enginemailer.');
    return json(200, { skipped: true });
  }

  let name, email;
  try {
    ({ name, email } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  try {
    await post('/Subscriber/Add', { ListId: LIST_ID, Email: email, Fields: { Name: name } });
    if (WELCOME_TEMPLATE_ID) {
      await post('/Email/SendTemplate', { TemplateId: WELCOME_TEMPLATE_ID, To: email, MergeFields: { Name: name } });
    }
    return json(200, { subscribed: true });
  } catch (err) {
    // Non-fatal — signup already succeeded via Supabase Auth before this is called.
    console.error('subscribe-enginemailer error:', err);
    return json(200, { subscribed: false });
  }
};
