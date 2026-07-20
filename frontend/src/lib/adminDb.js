import { supabaseAdmin } from './supabaseAdmin.js';

const MONTHLY_USD = 9.99;
const ANNUAL_USD = 89.99;
const FAMILY_MULTIPLIER = 1.5;

export async function getDashboardStats() {
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, name, email, subscription_status, subscription_plan, subscription_tier, created_at')
    .order('created_at', { ascending: false });
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

  return {
    totalUsers: users.length,
    totalChildren: totalChildren ?? 0,
    paidSubscribers,
    pastDueSubscriptions,
    mrrUsd,
    totalLessons: totalLessons ?? 0,
    lessonsCompletedToday: lessonsCompletedToday ?? 0,
    recentSignups: users.slice(0, 10),
  };
}

export async function listUsers({ search, status } = {}) {
  let query = supabaseAdmin
    .from('users')
    .select('id, name, email, role, subscription_status, subscription_plan, subscription_tier, created_at')
    .order('created_at', { ascending: false });

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
