const { json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/notify-pillar-interest  { email, pillarName }
// Fire-and-forget confirmation email for the "Notify Me" form on
// ComingSoonPillar.jsx. The actual interest signup is already recorded in
// contact_messages by submitContactMessage() before this is called — this
// function only sends the "we got it" confirmation, it doesn't store
// anything itself. Not auth-gated: it only ever emails the caller's own
// just-submitted address, same justification as subscribe-enginemailer.js.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  let email;
  let pillarName;
  try {
    ({ email, pillarName } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!email || !pillarName) return json(400, { message: 'Email and pillarName are required.' });

  try {
    const html = emailLayout({
      title: "You're on the list!",
      bodyHtml: `
        <p>Thanks for your interest in <strong>${pillarName}</strong>.</p>
        <p>We'll email you at this address the moment this track launches on ArabiKids.</p>
      `,
    });

    const sendResult = await sendTransactionalEmail({
      toEmail: email,
      subject: `We'll notify you when ${pillarName} launches`,
      html,
      campaignName: 'ArabiKids Pillar Interest Confirmation',
    });

    return json(200, { sent: sendResult.sent });
  } catch (err) {
    // Non-fatal — the interest signup itself already succeeded via
    // submitContactMessage() before this runs.
    console.error('notify-pillar-interest error:', err);
    return json(200, { sent: false });
  }
};
