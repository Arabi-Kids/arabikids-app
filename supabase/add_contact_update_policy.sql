-- Additive migration for the LIVE project — adds the missing UPDATE policy
-- on contact_messages. schema.sql already defines INSERT (public) and
-- SELECT (admin) policies for this table but never an UPDATE one, so the
-- admin Support page's "Mark as Handled" toggle silently updates 0 rows
-- (RLS blocks it without raising a client-visible error). Safe to run now
-- even with real data in the DB — adds one policy, touches nothing else.
-- Run once in the Supabase SQL Editor.

create policy "contact_update_admin" on public.contact_messages for update
  using (public.is_admin());
