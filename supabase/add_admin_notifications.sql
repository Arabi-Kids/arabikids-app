-- Additive migration for the LIVE project - adds the table backing the
-- admin portal's custom notification broadcasts. Serves two purposes at
-- once: (1) a send-history log for the admin portal, (2) the source of
-- truth for the customer-facing in-app "Announcements" feed on Account.jsx.
-- Safe to run now even with real data in the DB - adds one table, touches
-- nothing else. Run once in the Supabase SQL Editor.

create table if not exists public.admin_notifications (
  id serial primary key,
  title text not null,
  body text not null,
  url text,
  sent_by uuid not null references public.users(id),
  recipient_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications enable row level security;

-- Any authenticated user can read the feed (this is the in-app notification
-- list every logged-in parent sees) - only the service role (via the
-- send-admin-notification Netlify Function) ever inserts a row.
drop policy if exists "admin_notifications_select" on public.admin_notifications;
create policy "admin_notifications_select" on public.admin_notifications for select
  using (auth.uid() is not null);
