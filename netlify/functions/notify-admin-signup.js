const { json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/notify-admin-signup  { name, email }
// Fire-and-forget admin alert email, called right after signup alongside
// send-welcome-email.js / subscribe-enginemailer.js - same "notify admin on
// a significant event" pattern already used for Stripe subscribe/cancel/
// past-due events (see stripe-webhook.js's notifyAdmin()), just triggered
// from the client instead of a webhook since signup has no webhook of its
// own. Not auth-gated: never touches anything but the just-submitted name/
// email, same justification as send-welcome-email.js.
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@arabikids.online';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  let name;
  let email;
  try {
    ({ name, email } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  try {
    const html = emailLayout({
      title: 'New ArabiKids Registration',
      bodyHtml: `<p><strong>${name || 'A new parent'}</strong> just registered with <strong>${email}</strong>.</p>`,
    });

    const sendResult = await sendTransactionalEmail({
      toEmail: ADMIN_EMAIL,
      subject: `New registration: ${name || email}`,
      html,
      campaignName: 'ArabiKids Admin Alert',
    });

    return json(200, { sent: sendResult.sent });
  } catch (err) {
    console.error('notify-admin-signup error:', err);
    return json(200, { sent: false });
  }
};
