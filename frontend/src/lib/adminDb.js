import { supabaseAdmin } from './supabaseAdmin.js';

const MONTHLY_USD = 9.99;
const ANNUAL_USD = 89.99;
const FAMILY_MULTIPLIER = 1.5;

// Affiliates get a real auth.users row (they share the same Supabase Auth
// backend as customers/admins, just a distinct client storageKey - see
// lib/supabaseAffiliate.js), which means the on-signup DB trigger also
// creates a harmless, unused public.users row for them (deliberately not
// special-cased there - see supabase/add_affiliate_program.sql's header
// comment for why). Excluded here so affiliate accounts never inflate
// customer counts/lists.
async function getAffiliateAuthUserIds() {
  const { data, error } = await supabaseAdmin.from('affiliates').select('auth_user_id');
  if (error) throw new Error(error.message);
  return data.map((a) => a.auth_user_id);
}

export async function getDashboardStats() {
  const affiliateIds = await getAffiliateAuthUserIds();
  let query = supabaseAdmin
    .from('users')
    .select('id, name, email, subscription_status, subscription_plan, subscription_tier, created_at')
    .order('created_at', { ascending: false });
  if (affiliateIds.length) query = query.not('id', 'in', `(${affiliateIds.join(',')})`);
  const { data: users, error: usersError } = await query;
  if (usersError) throw new Error(usersError.message);

  const { count: totalLessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id', { count: 'exact', head: true });
  if (lessonsError) throw new Error(lessonsError.message);

  const { count: totalChildren, error: childrenError } = await supabaseAdmin
    .from('child_profiles')
    .select('id', { count: 'exact', head: true });
  if (childrenError) throw new Error(childrenError.message);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const { count: lessonsCompletedToday, error: progressError } = await supabaseAdmin
    .from('child_lesson_progress')
    .select('id', { count: 'exact', head: true })
    .gte('completed_at', startOfToday.toISOString());
  if (progressError) throw new Error(progressError.message);

  const paidSubscribers = users.filter((u) => u.subscription_status === 'active').length;
  const pastDueSubscriptions = users.filter((u) => u.subscription_status === 'past_due').length;
  const mrrUsd = users.reduce((sum, u) => {
    if (u.subscription_status !== 'active') return sum;
    const base = u.subscription_plan === 'annual' ? ANNUAL_USD / 12 : u.subscription_plan === 'monthly' ? MONTHLY_USD : 0;
    return sum + (u.subscription_tier === 'family' ? base * FAMILY_MULTIPLIER : base);
  }, 0);

  const newSignupsToday = users.filter((u) => new Date(u.created_at) >= startOfToday).length;

  return {
    totalUsers: users.length,
    totalChildren: totalChildren ?? 0,
    paidSubscribers,
    pastDueSubscriptions,
    mrrUsd,
    totalLessons: totalLessons ?? 0,
    lessonsCompletedToday: lessonsCompletedToday ?? 0,
    newSignupsToday,
    recentSignups: users.slice(0, 10),
  };
}

export async function listUsers({ search, status } = {}) {
  const affiliateIds = await getAffiliateAuthUserIds();
  let query = supabaseAdmin
    .from('users')
    .select('id, name, email, role, subscription_status, subscription_plan, subscription_tier, created_at, signup_source')
    .order('created_at', { ascending: false });

  if (affiliateIds.length) query = query.not('id', 'in', `(${affiliateIds.join(',')})`);
  if (status) query = query.eq('subscription_status', status);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: users, error } = await query;
  if (error) throw new Error(error.message);

  const { data: children, error: childrenError } = await supabaseAdmin
    .from('child_profiles')
    .select('id, parent_id, name, current_stage_id');
  if (childrenError) throw new Error(childrenError.message);

  const childrenByParent = new Map();
  for (const child of children) {
    if (!childrenByParent.has(child.parent_id)) childrenByParent.set(child.parent_id, []);
    childrenByParent.get(child.parent_id).push(child);
  }

  return users.map((u) => ({ ...u, children: childrenByParent.get(u.id) ?? [] }));
}

export async function updateUserSubscriptionStatus(userId, subscriptionStatus) {
  const { error } = await supabaseAdmin.from('users').update({ subscription_status: subscriptionStatus }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function updateUserSubscriptionTier(userId, subscriptionTier) {
  const { error } = await supabaseAdmin.from('users').update({ subscription_tier: subscriptionTier }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function listSubscriptions() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, subscription_plan, subscription_tier, subscription_status, current_period_end')
    .in('subscription_status', ['active', 'past_due', 'canceled'])
    .order('current_period_end', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Curriculum (levels/stages/lessons)
// ---------------------------------------------------------------------------

export async function listAdminLevelsAndStages() {
  const [{ data: levels, error: levelsError }, { data: stages, error: stagesError }] = await Promise.all([
    supabaseAdmin.from('levels').select('*').order('order_index'),
    supabaseAdmin.from('stages').select('*').order('order_index'),
  ]);
  if (levelsError) throw new Error(levelsError.message);
  if (stagesError) throw new Error(stagesError.message);
  return { levels, stages };
}

export async function listAdminLessonsForStage(stageId) {
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('id, stage_id, order_index, title, arabic_word, is_free, content')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createLesson(stageId, lesson) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('lessons')
    .select('order_index')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);
  const nextOrderIndex = (existing[0]?.order_index ?? 0) + 1;

  const { error } = await supabaseAdmin.from('lessons').insert({ ...lesson, stage_id: stageId, order_index: nextOrderIndex });
  if (error) throw new Error(error.message);
}

export async function updateLesson(lessonId, updates) {
  const { error } = await supabaseAdmin.from('lessons').update(updates).eq('id', lessonId);
  if (error) throw new Error(error.message);
}

export async function deleteLesson(lessonId) {
  const { error } = await supabaseAdmin.from('lessons').delete().eq('id', lessonId);
  if (error) throw new Error(error.message);
}

export async function updateStage(stageId, updates) {
  const { error } = await supabaseAdmin.from('stages').update(updates).eq('id', stageId);
  if (error) throw new Error(error.message);
}

export async function listContactMessages({ status = 'all' } = {}) {
  let query = supabaseAdmin.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (status === 'open') query = query.eq('handled', false);
  if (status === 'handled') query = query.eq('handled', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function setContactMessageHandled(messageId, handled) {
  const { error } = await supabaseAdmin.from('contact_messages').update({ handled }).eq('id', messageId);
  if (error) throw new Error(error.message);
}

export async function updateLevel(levelId, updates) {
  const { error } = await supabaseAdmin.from('levels').update(updates).eq('id', levelId);
  if (error) throw new Error(error.message);
}

export async function listAdminNotifications() {
  const { data, error } = await supabaseAdmin.from('admin_notifications').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/** Calls the send-admin-notification Netlify Function under the ADMIN
 * portal's own session (supabaseAdmin, distinct storage key from the public
 * app's client) - the first admin action in this codebase that needs a
 * server-side effect (sending push with a private VAPID key) rather than a
 * direct Supabase call under is_admin() RLS.
 *
 * `userId` targets one specific client; `filters` (`{status, dateFrom,
 * dateTo}`) targets a segment; passing neither broadcasts to everyone
 * (today's original behavior). `recipientLabel` is a human-readable
 * description of the resolved audience, stored as-is for the send-history
 * list - purely cosmetic, the actual audience is always re-resolved
 * server-side. */
export async function sendAdminNotification({ title, body, url, sendPush, sendEmail, userId, filters, recipientLabel }) {
  const {
    data: { session },
  } = await supabaseAdmin.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated.');

  const res = await fetch('/api/send-admin-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({
      title,
      body,
      url: url || undefined,
      sendPush: sendPush !== false,
      sendEmail: !!sendEmail,
      userId: userId || undefined,
      filters: filters || undefined,
      recipientLabel: recipientLabel || undefined,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to send notification.');
  return data;
}

// ---------------------------------------------------------------------------
// Affiliate program
// ---------------------------------------------------------------------------

export async function listAffiliates({ search } = {}) {
  let query = supabaseAdmin.from('affiliates').select('*').order('created_at', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,referral_code.ilike.%${search}%`);
  const { data: affiliates, error } = await query;
  if (error) throw new Error(error.message);

  const [{ data: referrals, error: referralsError }, { data: payouts, error: payoutsError }] = await Promise.all([
    supabaseAdmin.from('referrals').select('affiliate_id, status'),
    supabaseAdmin.from('affiliate_payouts').select('affiliate_id, amount_cents').eq('status', 'pending'),
  ]);
  if (referralsError) throw new Error(referralsError.message);
  if (payoutsError) throw new Error(payoutsError.message);

  return affiliates.map((a) => {
    const theirReferrals = referrals.filter((r) => r.affiliate_id === a.id);
    const activeCount = theirReferrals.filter((r) => r.status === 'active').length;
    const currentTierRate = activeCount >= 30 ? 0.2 : activeCount >= 10 ? 0.15 : 0.1;
    const pendingCents = payouts.filter((p) => p.affiliate_id === a.id).reduce((sum, p) => sum + p.amount_cents, 0);
    return { ...a, activeReferralCount: activeCount, currentTierRate, pendingPayoutCents: pendingCents };
  });
}

function maskEmail(email) {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 3)}***@${domain}`;
}

export async function listReferrals({ search, affiliateId, status } = {}) {
  let query = supabaseAdmin
    .from('referrals')
    .select('id, affiliate_id, customer_id, commission_tier_at_signup, commission_start_date, cap_expires_at, status, created_at')
    .order('created_at', { ascending: false });
  if (affiliateId) query = query.eq('affiliate_id', affiliateId);
  if (status) query = query.eq('status', status);
  const { data: referrals, error } = await query;
  if (error) throw new Error(error.message);
  if (!referrals.length) return [];

  const [{ data: affiliates, error: affiliatesError }, { data: customers, error: customersError }] = await Promise.all([
    supabaseAdmin.from('affiliates').select('id, name'),
    supabaseAdmin.from('users').select('id, email').in('id', referrals.map((r) => r.customer_id)),
  ]);
  if (affiliatesError) throw new Error(affiliatesError.message);
  if (customersError) throw new Error(customersError.message);

  const affiliateNameById = new Map(affiliates.map((a) => [a.id, a.name]));
  const emailById = new Map(customers.map((c) => [c.id, c.email]));
  const now = new Date();

  const rows = referrals.map((r) => ({
    ...r,
    affiliateName: affiliateNameById.get(r.affiliate_id) ?? '—',
    maskedCustomerEmail: maskEmail(emailById.get(r.customer_id)),
    monthsRemaining:
      r.status === 'active' && r.cap_expires_at
        ? Math.max(0, Math.ceil((new Date(r.cap_expires_at) - now) / (1000 * 60 * 60 * 24 * 30)))
        : null,
  }));

  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter((r) => r.affiliateName.toLowerCase().includes(needle) || r.maskedCustomerEmail.toLowerCase().includes(needle));
}

export async function markPayoutSent(payoutId, adminUserId) {
  const { error } = await supabaseAdmin
    .from('affiliate_payouts')
    .update({ status: 'sent', sent_at: new Date().toISOString(), marked_by: adminUserId })
    .eq('id', payoutId);
  if (error) throw new Error(error.message);
}

export async function listPendingPayouts(affiliateId) {
  const { data, error } = await supabaseAdmin
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('period_month', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAffiliateStatus(affiliateId, status) {
  const { error } = await supabaseAdmin.from('affiliates').update({ status }).eq('id', affiliateId);
  if (error) throw new Error(error.message);
}
