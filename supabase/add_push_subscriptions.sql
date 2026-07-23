-- Additive migration for the LIVE project - adds push_subscriptions, storing
-- one row per browser/device subscribed to Web Push notifications for a
-- given child (streak reminders are per-child, so subscriptions are too - a
-- parent may enable reminders for one child but not another on the same
-- device). Safe to run now even with real data in the DB - adds one table,
-- touches nothing else. Run once in the Supabase SQL Editor.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (child_id, endpoint)
);

create index idx_push_subscriptions_child on public.push_subscriptions(child_id);

alter table public.push_subscriptions enable row level security;

-- A parent manages push subscriptions only for their own children. The
-- daily reminder Netlify Function reads/deletes via the service role key,
-- which bypasses RLS entirely, so no admin/service policy is needed here.
create policy "push_subscriptions_select" on public.push_subscriptions for select
  using (public.owns_child(child_id));
create policy "push_subscriptions_insert" on public.push_subscriptions for insert
  with check (public.owns_child(child_id));
create policy "push_subscriptions_delete" on public.push_subscriptions for delete
  using (public.owns_child(child_id));
