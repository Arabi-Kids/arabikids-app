-- Additive migration for the LIVE project - adds email_recipient_count to
-- admin_notifications, since a broadcast can now optionally also go out as
-- a marketing email (reusing the existing Enginemailer transactional-send
-- helper) alongside the real push notification. Safe to run now - one
-- nullable-default column, touches nothing else. Run once in the Supabase
-- SQL Editor.

alter table public.admin_notifications add column if not exists email_recipient_count int not null default 0;
