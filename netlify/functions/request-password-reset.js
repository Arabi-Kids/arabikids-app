const { getServiceClient, json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/request-password-reset  { email }
// Generates a Supabase recovery link via the Admin API (server-side only —
// needs the service role key) WITHOUT letting Supabase send its own default
// email, then delivers it through Enginemailer with ArabiKids branding.
//
// Always returns a generic success message regardless of whether the email
// exists, so this can't be used to enumerate registered accounts.
const FRONTEND_URL = process.env.FRONTEND_URL;
const GENERIC_MESSAGE = 'If an account exists for that email, a password reset link is on its way.';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email) return json(400, { message: 'Email is required.' });

  const supabase = getServiceClient();

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${FRONTEND_URL}/reset-password` },
    });

    if (error || !data?.properties?.action_link) {
      // Most likely "user not found" — don't leak that. Log it, tell the caller nothing went wrong.
      console.warn('request-password-reset: generateLink failed (likely no such user):', error?.message);
      return json(200, { message: GENERIC_MESSAGE });
    }

    const html = emailLayout({
      title: 'Reset Your Password',
      bodyHtml: `
        <p>We received a request to reset the password on your ArabiKids account.</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p>This link expires in 1 hour.</p>
      `,
      ctaText: 'Reset Password',
      ctaUrl: data.properties.action_link,
    });

    const sendResult = await sendTransactionalEmail({
      toEmail: email,
      subject: 'Reset your ArabiKids password',
      html,
      campaignName: 'ArabiKids Password Reset',
    });

    if (!sendResult.sent) {
      // Enginemailer sender domain probably isn't verified yet — fall back to
      // Supabase's own built-in reset email so the flow still works end to end.
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${FRONTEND_URL}/reset-password` });
    }

    return json(200, { message: GENERIC_MESSAGE });
  } catch (err) {
    console.error('request-password-reset error:', err);
    return json(200, { message: GENERIC_MESSAGE });
  }
};
