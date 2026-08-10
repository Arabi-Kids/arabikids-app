-- Additive migration for the LIVE project - extends admin_notifications so
-- a broadcast can now optionally target one specific client or a filtered
-- segment (by subscription status / registration date range) instead of
-- only ever going to everyone. Safe to run now even with real data in the
-- DB - two nullable columns, touches nothing else. Run once in the
-- Supabase SQL Editor.

alter table public.admin_notifications add column if not exists recipient_user_id uuid references public.users(id);
alter table public.admin_notifications add column if not exists recipient_label text;
