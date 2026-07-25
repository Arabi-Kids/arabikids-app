-- Additive migration for the LIVE project - adds kid-facing and parent-facing
-- intro copy to each stage. Every stage currently has just a bare name; this
-- gives kids a one-line expectation ("what you'll learn") and gives parents a
-- short explanation of what the stage teaches, why it matters for real Quran
-- reading, and what activities their child actually does. Safe to run now
-- even with real data in the DB - adds two nullable columns, touches nothing
-- else. Run once in the Supabase SQL Editor.

alter table public.stages add column if not exists intro_kids text;
alter table public.stages add column if not exists intro_parents text;
