-- Additive migration for the LIVE project - adds signup_source to
-- public.users for basic acquisition analytics (which referrer/UTM
-- campaign/Google Ads click brought in each signup). Captured client-side
-- at first page load (see frontend/src/lib/attribution.js) and written once
-- during registration - never overwritten afterward, so it reflects
-- first-touch attribution even if the same browser signs up days later.
-- Safe to run now - one nullable column, touches nothing else. Run once in
-- the Supabase SQL Editor.

alter table public.users add column if not exists signup_source jsonb;
