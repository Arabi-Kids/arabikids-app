const webpush = require('web-push');
const { getServiceClient, getAuthedUser, json } = require('./_lib');
const { sendTransactionalEmail, emailLayout } = require('./_enginemailer');

// POST /api/send-admin-notification  { title, body, url?, sendEmail? }
// Requires Authorization: Bearer <supabase access token> AND that user must
// have role = 'admin' on public.users - the first Netlify Function in this
// codebase that checks caller-is-admin (no existing helper for this, see
// _lib.js's getAuthedUser, which only confirms a valid session).
//
// Two independent broadcast channels, both "everyone" (no audience
// targeting, per that decision):
// 1. Real push to every row in push_subscriptions - same web-push/VAPID
//    pattern as the scheduled send-streak-reminders.js function.
// 2. Optional marketing email (only when `sendEmail` is true) to every
//    parent account's email, reusing the existing Enginemailer transactional
//    helper (_enginemailer.js) one send at a time, same fan-out shape as the
//    push loop.
// Always logs one row to admin_notifications - which doubles as the
// customer-facing in-app "Announcements" feed on Account.jsx.

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  const authUser = await getAuthedUser(event);
  if (!authUser) return json(401, { message: 'Not authenticated.' });

  const supabase = getServiceClient();

  const { data: userRow, error: userError } = await supabase.from('users').select('role').eq('id', authUser.id).single();
  if (userError || userRow?.role !== 'admin') return json(403, { message: 'Admins only.' });

  let title, body, url, sendEmail;
  try {
    ({ title, body, url, sendEmail } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!title || !body) return json(400, { message: 'title and body are required.' });

  // --- Channel 1: push (skips gracefully, not a hard error, if unconfigured -
  // an email-only broadcast must still work either way). ---
  let sent = 0;
  let pruned = 0;
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:hello@arabikids.online', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const { data: subscriptions, error: subsError } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth');
    if (subsError) throw new Error(subsError.message);

    const payload = JSON.stringify({ title, body, url: url || undefined });
    const staleSubscriptionIds = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
          sent += 1;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            staleSubscriptionIds.push(sub.id);
          } else {
            console.error('send-admin-notification: push failed for', sub.id, err.message);
          }
        }
      })
    );

    if (staleSubscriptionIds.length) {
      await supabase.from('push_subscriptions').delete().in('id', staleSubscriptionIds);
    }
    pruned = staleSubscriptionIds.length;
  } else {
    console.warn('send-admin-notification: VAPID keys not configured, skipping push.');
  }

  // --- Channel 2: marketing email, opt-in per broadcast, to every parent
  // account (not admin accounts) - reuses the existing per-recipient
  // Enginemailer sender, which itself no-ops safely if not configured. ---
  let emailsSent = 0;
  if (sendEmail) {
    const { data: parents, error: parentsError } = await supabase.from('users').select('email, name').eq('role', 'parent');
    if (parentsError) throw new Error(parentsError.message);

    const html = emailLayout({ title, bodyHtml: `<p>${body}</p>`, ctaText: url ? 'Learn More' : undefined, ctaUrl: url || undefined });

    await Promise.all(
      parents.map(async (p) => {
        const result = await sendTransactionalEmail({ toEmail: p.email, subject: title, html, campaignName: 'ArabiKids Announcement' });
        if (result.sent) emailsSent += 1;
      })
    );
  }

  const { error: insertError } = await supabase.from('admin_notifications').insert({
    title,
    body,
    url: url || null,
    sent_by: authUser.id,
    recipient_count: sent,
    email_recipient_count: emailsSent,
  });
  if (insertError) throw new Error(insertError.message);

  return json(200, { sent, pruned, emailsSent });
};
