import { supabaseAdmin } from './supabaseAdmin.js';

const MONTHLY_USD = 9.99;
const ANNUAL_USD = 89.99;

export async function getDashboardStats() {
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, name, email, subscription_status, subscription_plan, created_at')
    .order('created_at', { ascending: false });
  if (usersError) throw new Error(usersError.message);

  const { count: totalLessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id', { count: 'exact', head: true });
  if (lessonsError) throw new Error(lessonsError.message);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const { count: lessonsCompletedToday, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('id', { count: 'exact', head: true })
    .gte('completed_at', startOfToday.toISOString());
  if (progressError) throw new Error(progressError.message);

  const paidSubscribers = users.filter((u) => u.subscription_status === 'active').length;
  const pastDueSubscriptions = users.filter((u) => u.subscription_status === 'past_due').length;
  const mrrUsd = users.reduce((sum, u) => {
    if (u.subscription_status !== 'active') return sum;
    if (u.subscription_plan === 'annual') return sum + ANNUAL_USD / 12;
    if (u.subscription_plan === 'monthly') return sum + MONTHLY_USD;
    return sum;
  }, 0);

  return {
    totalUsers: users.length,
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
    .select('id, name, email, child_name, age_group, role, subscription_status, subscription_plan, created_at')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('subscription_status', status);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUserSubscriptionStatus(userId, subscriptionStatus) {
  const { error } = await supabaseAdmin.from('users').update({ subscription_status: subscriptionStatus }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function listSubscriptions() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, subscription_plan, subscription_status, current_period_end')
    .in('subscription_status', ['active', 'past_due', 'canceled'])
    .order('current_period_end', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function listAdminLessons() {
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('id, age_group, lesson_number, title, arabic_word, is_free, content')
    .order('age_group', { ascending: true })
    .order('lesson_number', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLesson(lessonId, updates) {
  const { error } = await supabaseAdmin.from('lessons').update(updates).eq('id', lessonId);
  if (error) throw new Error(error.message);
}
