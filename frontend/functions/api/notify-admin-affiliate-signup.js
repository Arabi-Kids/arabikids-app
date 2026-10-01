import { json } from '../_shared/lib.js';
import { sendTransactionalEmail, emailLayout } from '../_shared/enginemailer.js';

// POST /api/notify-admin-affiliate-signup  { name, email, country, referralCode }
// Fire-and-forget admin alert, same "notify admin on a significant event"
// pattern as notify-admin-signup.js - informational only, affiliate
// registration is auto-approved and needs no gate. Not auth-gated: never
// touches anything but the just-submitted registration details, same
// justification as notify-admin-signup.js.
export async function onRequestPost({ request, env }) {
  const ADMIN_EMAIL = env.ADMIN_NOTIFICATION_EMAIL || 'hello@arabikids.online';

  let name;
  let email;
  let country;
  let referralCode;
  try {
    ({ name, email, country, referralCode } = JSON.parse((await request.text()) || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  try {
    const html = emailLayout({
      title: 'New Affiliate Registration',
      bodyHtml: `<p><strong>${name || 'A new affiliate'}</strong> (${email}) just registered from <strong>${country || 'an unknown country'}</strong>.</p><p>Referral code: <strong>${referralCode || 'n/a'}</strong></p>`,
    });

    const sendResult = await sendTransactionalEmail({
      env,
      toEmail: ADMIN_EMAIL,
      subject: `New affiliate: ${name || email}`,
      html,
      campaignName: 'ArabiKids Admin Alert',
    });

    return json(200, { sent: sendResult.sent });
  } catch (err) {
    console.error('notify-admin-affiliate-signup error:', err);
    return json(200, { sent: false });
  }
}
