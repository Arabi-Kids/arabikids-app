-- Additive migration for the LIVE project — adds ONLY placement_questions
-- and child_badges. Does NOT touch users/child_profiles/lessons/progress,
-- unlike schema.sql (which drops and rebuilds most tables and is only safe
-- on a fresh project). Safe to run now even with real signups in the DB.
-- Run once in the Supabase SQL Editor.

create table if not exists public.placement_questions (
  id serial primary key,
  stage_id int not null references public.stages(id),
  instruction text not null,
  options jsonb not null,
  correct_answer text not null
);

create index if not exists idx_placement_questions_stage on public.placement_questions(stage_id);

alter table public.placement_questions enable row level security;

drop policy if exists "placement_questions_select_all" on public.placement_questions;
create policy "placement_questions_select_all" on public.placement_questions for select using (true);

drop policy if exists "placement_questions_admin_write" on public.placement_questions;
create policy "placement_questions_admin_write" on public.placement_questions for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.child_badges (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  unique (child_id, badge_code)
);

create index if not exists idx_child_badges_child on public.child_badges(child_id);

alter table public.child_badges enable row level security;

drop policy if exists "child_badges_select" on public.child_badges;
create policy "child_badges_select" on public.child_badges for select
  using (public.owns_child(child_id) or public.is_admin());

drop policy if exists "child_badges_insert" on public.child_badges;
create policy "child_badges_insert" on public.child_badges for insert
  with check (public.owns_child(child_id));
