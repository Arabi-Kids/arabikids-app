// Shared Enginemailer transactional-email sender, used by subscribe-enginemailer.js
// (welcome email) and request-password-reset.js. Verified against Enginemailer's
// real "Submitting Transactional Emails via REST-API Version 2" docs.
//
// Requires a domain verified in Enginemailer (Account Settings > Domain
// Verification) — SenderEmail is validated against it. Until
// ENGINEMAILER_SENDER_EMAIL is set to an address on a verified domain, this
// no-ops safely rather than erroring out signup/reset flows.
const SEND_URL = 'https://api.enginemailer.com/RESTAPI/V2/Submission/SendEmail';
const API_KEY = process.env.ENGINEMAILER_API_KEY;
const SENDER_EMAIL = process.env.ENGINEMAILER_SENDER_EMAIL;
const SENDER_NAME = process.env.ENGINEMAILER_SENDER_NAME || 'ArabiKids';

async function sendTransactionalEmail({ toEmail, subject, html, campaignName }) {
  if (!API_KEY || !SENDER_EMAIL) {
    console.warn('Enginemailer sender not configured yet (missing API key or verified sender domain) — skipping email send.');
    return { sent: false, reason: 'not_configured' };
  }

  const res = await fetch(SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', APIKey: API_KEY },
    body: JSON.stringify({
      CampaignName: campaignName,
      ToEmail: toEmail,
      Subject: subject,
      SenderEmail: SENDER_EMAIL,
      SenderName: SENDER_NAME,
      SubmittedContent: html,
    }),
  });
  const data = await res.json().catch(() => ({}));
  const ok = res.ok && data?.Result?.Status === 'OK';
  if (!ok) {
    console.error('Enginemailer SendEmail failed:', JSON.stringify(data));
    return { sent: false, reason: 'send_failed', detail: data };
  }
  return { sent: true };
}

// Simple inline-styled layout — email clients don't reliably support <style>
// blocks or external CSS, so everything brand-related is inlined.
function emailLayout({ title, bodyHtml, ctaText, ctaUrl }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fbf9f3;font-family:Arial,Helvetica,sans-serif;color:#1f2a37;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf9f3;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:#1b4f8a;padding:24px 32px;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;">Arabi<span style="color:#f0b93d;">Kids</span></span>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#1b4f8a;">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#4b5a6a;">${bodyHtml}</div>
            ${
              ctaUrl
                ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td style="background:#c8960c;border-radius:999px;"><a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;text-decoration:none;font-size:15px;">${ctaText}</a></td></tr></table>`
                : ''
            }
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f4f1e8;color:#8ea0b6;font-size:12px;">
            Teaching the Language of the Quran — One Kid at a Time.<br/>ArabiKids
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

module.exports = { sendTransactionalEmail, emailLayout };
