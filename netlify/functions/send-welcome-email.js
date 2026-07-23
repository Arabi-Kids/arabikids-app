const { json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/send-welcome-email  { name, email }
// Fire-and-forget branded welcome email, called right after signup
// alongside subscribe-enginemailer.js. This does NOT replace Supabase's own
// "Confirm signup" email (still required to activate the account) - it's a
// second, ArabiKids-branded email sent via the same Enginemailer sender
// already used for password resets, so a real welcome experience doesn't
// depend on Supabase custom SMTP / domain verification (a separate, harder
// blocker - see supabase/email-templates/confirm-signup.html's header
// comment). Not auth-gated: only ever emails the caller's own
// just-submitted address, same justification as subscribe-enginemailer.js.
const FRONTEND_URL = process.env.FRONTEND_URL;

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
      title: `Welcome to ArabiKids, ${name || 'friend'}!`,
      bodyHtml: `
        <p>We're so glad you're here. ArabiKids helps your child connect Arabic and the Quran, one lesson at a time.</p>
        <p>Log in, add your child's profile, and Stage 1 is free to start today - no credit card needed.</p>
      `,
      ctaText: 'Start Learning',
      ctaUrl: FRONTEND_URL,
    });

    const sendResult = await sendTransactionalEmail({
      toEmail: email,
      subject: 'Welcome to ArabiKids!',
      html,
      campaignName: 'ArabiKids Welcome Email',
    });

    return json(200, { sent: sendResult.sent });
  } catch (err) {
    console.error('send-welcome-email error:', err);
    return json(200, { sent: false });
  }
};
