import { buildPushHTTPRequest } from '@pushforge/builder';
import { getServiceClient, getAuthedUser, json } from '../_shared/lib.js';
import { sendTransactionalEmail, emailLayout } from '../_shared/enginemailer.js';

// POST /api/send-admin-notification
//   { title, body, url?, sendPush?, sendEmail?, userId?, filters?, recipientLabel? }
// Requires Authorization: Bearer <supabase access token> AND that user must
// have role = 'admin' on public.users.
//
// Two independent channels (push / email), each individually optional via
// `sendPush`/`sendEmail` (both default true/false respectively, matching
// the original all-push-always-on, email-opt-in behavior when neither
// targeting param is passed).
//
// Audience resolution - three modes, resolved server-side regardless of
// what the caller's UI showed, since a client-computed match count/list
// must never be trusted for an action with a real-world side effect:
//   1. `userId` given -> that one user only.
//   2. `filters` given ({status?, dateFrom?, dateTo?}) -> every `role =
//      'parent'` user matching subscription_status / created_at range.
//   3. Neither given -> today's original unfiltered broadcast (every push
//      subscription, every parent's email) - kept as a distinct fast path
//      so a plain "send to everyone" doesn't pay for an extra users query.
//
// push_subscriptions is keyed by child_id, not user_id (see
// add_push_subscriptions.sql) - targeting a set of users for push means
// first resolving their children via child_profiles.parent_id.
//
// Always logs one row to admin_notifications - which doubles as the
// customer-facing in-app "Announcements" feed on Account.jsx.
export async function onRequestPost({ request, env }) {
  const authUser = await getAuthedUser(request, env);
  if (!authUser) return json(401, { message: 'Not authenticated.' });

  const supabase = getServiceClient(env);

  const { data: userRow, error: userError } = await supabase.from('users').select('role').eq('id', authUser.id).single();
  if (userError || userRow?.role !== 'admin') return json(403, { message: 'Admins only.' });

  let title, body, url, sendPush, sendEmail, userId, filters, recipientLabel;
  try {
    ({ title, body, url, sendPush, sendEmail, userId, filters, recipientLabel } = JSON.parse((await request.text()) || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!title || !body) return json(400, { message: 'title and body are required.' });
  sendPush = sendPush !== false;
  sendEmail = !!sendEmail;
  if (!sendPush && !sendEmail) return json(400, { message: 'Select at least one channel (push or email).' });

  // --- Resolve target user ids: null means "broadcast, unfiltered". ---
  let targetUserIds = null;
  if (userId) {
    targetUserIds = [userId];
  } else if (filters && (filters.status || filters.dateFrom || filters.dateTo)) {
    let query = supabase.from('users').select('id').eq('role', 'parent');
    if (filters.status) query = query.eq('subscription_status', filters.status);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
    const { data: matched, error: matchedError } = await query;
    if (matchedError) throw new Error(matchedError.message);
    targetUserIds = matched.map((u) => u.id);
  }

  // --- Channel 1: push (skips gracefully, not a hard error, if unconfigured -
  // an email-only send must still work either way). Uses @pushforge/builder
  // instead of the `web-push` npm package - `web-push` depends on Node's
  // `crypto.createECDH`, which isn't available in the Cloudflare
  // Workers/Pages runtime even with the nodejs_compat flag; pushforge builds
  // the same VAPID-authenticated, encrypted push request using only
  // standard Web Crypto, and hands back a plain {endpoint, headers, body}
  // for us to fetch() ourselves - see VAPID_PRIVATE_KEY_JWK's own comment
  // for why the key is stored in JWK format now instead of web-push's
  // raw-base64url format. ---
  let sent = 0;
  let pruned = 0;
  if (sendPush && env.VAPID_PRIVATE_KEY_JWK) {
    const privateJWK = JSON.parse(env.VAPID_PRIVATE_KEY_JWK);
    const adminContact = env.VAPID_SUBJECT || 'mailto:hello@arabikids.online';

    let subsQuery = supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth');
    if (targetUserIds) {
      const { data: children, error: childrenError } = await supabase
        .from('child_profiles')
        .select('id')
        .in('parent_id', targetUserIds);
      if (childrenError) throw new Error(childrenError.message);
      const childIds = children.map((c) => c.id);
      subsQuery = childIds.length > 0 ? subsQuery.in('child_id', childIds) : null;
    }

    const { data: subscriptions, error: subsError } = subsQuery ? await subsQuery : { data: [], error: null };
    if (subsError) throw new Error(subsError.message);

    const staleSubscriptionIds = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const { endpoint, headers, body } = await buildPushHTTPRequest({
            privateJWK,
            subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            message: { payload: { title, body, url: url || undefined }, adminContact },
          });
          const res = await fetch(endpoint, { method: 'POST', headers, body });
          if (res.ok) {
            sent += 1;
          } else if (res.status === 404 || res.status === 410) {
            staleSubscriptionIds.push(sub.id);
          } else {
            console.error('send-admin-notification: push failed for', sub.id, res.status, await res.text().catch(() => ''));
          }
        } catch (err) {
          console.error('send-admin-notification: push failed for', sub.id, err.message);
        }
      })
    );

    if (staleSubscriptionIds.length) {
      await supabase.from('push_subscriptions').delete().in('id', staleSubscriptionIds);
    }
    pruned = staleSubscriptionIds.length;
  } else if (sendPush) {
    console.warn('send-admin-notification: VAPID key not configured, skipping push.');
  }

  // --- Channel 2: email, opt-in per send, reusing the existing
  // per-recipient Enginemailer sender, which itself no-ops safely if not
  // configured. ---
  let emailsSent = 0;
  if (sendEmail) {
    let recipientsQuery = supabase.from('users').select('email, name');
    recipientsQuery = targetUserIds ? recipientsQuery.in('id', targetUserIds) : recipientsQuery.eq('role', 'parent');
    const { data: recipients, error: recipientsError } = await recipientsQuery;
    if (recipientsError) throw new Error(recipientsError.message);

    const html = emailLayout({ title, bodyHtml: `<p>${body}</p>`, ctaText: url ? 'Learn More' : undefined, ctaUrl: url || undefined });

    await Promise.all(
      recipients.map(async (p) => {
        const result = await sendTransactionalEmail({ env, toEmail: p.email, subject: title, html, campaignName: 'ArabiKids Announcement' });
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
    recipient_user_id: userId || null,
    recipient_label: recipientLabel || null,
  });
  if (insertError) throw new Error(insertError.message);

  return json(200, { sent, pruned, emailsSent });
}
