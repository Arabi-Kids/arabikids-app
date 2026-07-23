const webpush = require('web-push');
const { getServiceClient } = require('./_lib');

// Scheduled Netlify Function (see `config.schedule` below) - runs once a
// day and pushes a "keep your streak!" notification to any child with an
// active streak who hasn't completed a lesson yet today (UTC day boundary,
// matching computeStreak() in frontend/src/lib/db.js). Not callable over
// HTTP in any meaningful way - Netlify invokes this on its own via the cron
// schedule, not from the frontend.

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

exports.handler = async () => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('send-streak-reminders: VAPID keys not configured, skipping run.');
    return { statusCode: 200, body: 'skipped: not configured' };
  }
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:hello@arabikids.online', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const supabase = getServiceClient();

  const { data: streakChildren, error: childrenError } = await supabase
    .from('child_profiles')
    .select('id, name')
    .gt('current_streak', 0);
  if (childrenError) throw new Error(childrenError.message);
  if (!streakChildren.length) return { statusCode: 200, body: 'no children with an active streak' };

  const childIds = streakChildren.map((c) => c.id);
  const { data: progressRows, error: progressError } = await supabase
    .from('child_lesson_progress')
    .select('child_id, completed_at')
    .in('child_id', childIds)
    .not('completed_at', 'is', null);
  if (progressError) throw new Error(progressError.message);

  const lastCompletedByChild = new Map();
  for (const row of progressRows) {
    const prev = lastCompletedByChild.get(row.child_id);
    if (!prev || row.completed_at > prev) lastCompletedByChild.set(row.child_id, row.completed_at);
  }

  const today = todayUtc();
  const atRiskChildren = streakChildren.filter((c) => {
    const last = lastCompletedByChild.get(c.id);
    return !last || last.slice(0, 10) !== today;
  });
  if (!atRiskChildren.length) return { statusCode: 200, body: 'everyone already learned today' };

  const atRiskIds = atRiskChildren.map((c) => c.id);
  const { data: subscriptions, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('id, child_id, endpoint, p256dh, auth')
    .in('child_id', atRiskIds);
  if (subsError) throw new Error(subsError.message);

  const nameByChildId = new Map(atRiskChildren.map((c) => [c.id, c.name]));
  const staleSubscriptionIds = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      const payload = JSON.stringify({
        title: 'ArabiKids',
        body: `${nameByChildId.get(sub.child_id)} hasn't practiced today - keep the streak alive!`,
        url: '/lessons',
      });
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent += 1;
      } catch (err) {
        // 404/410 means the browser unsubscribed or the subscription expired -
        // clean it up so future runs don't keep retrying a dead endpoint.
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleSubscriptionIds.push(sub.id);
        } else {
          console.error('send-streak-reminders: push failed for', sub.id, err.message);
        }
      }
    })
  );

  if (staleSubscriptionIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleSubscriptionIds);
  }

  return { statusCode: 200, body: `sent ${sent}, pruned ${staleSubscriptionIds.length} stale subscriptions` };
};

// Daily at 17:00 UTC - a reasonable "evening reminder" across most western
// timezones; adjust to taste once real usage data shows a better time.
exports.config = { schedule: '0 17 * * *' };
