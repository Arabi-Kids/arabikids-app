-- ArabiKids database schema (Supabase / Postgres) — v2
-- "Teaching the Language of the Quran, One Kid at a Time."
--
-- v2 replaces the flat Junior/Explorer (90-lesson) model with one continuous
-- curriculum: 4 Levels -> 4 Stages each -> 8-10 Lessons each (~150-160 total),
-- gated by a per-stage mastery checkpoint, plus multi-child parent accounts.
-- Pre-launch, no real customer data to migrate — this is a clean rebuild of
-- the previous schema, not a migration.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) on a fresh
-- project, or re-run on the dev project to reset to v2 (drops v1 tables).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Drop everything except `users` (clean, re-runnable rebuild — no production
-- data yet other than auth-linked accounts, which `users` preserves via an
-- ALTER-based upgrade below instead of a drop).
-- ---------------------------------------------------------------------------
drop table if exists public.placement_results cascade;
drop table if exists public.placement_questions cascade;
drop table if exists public.child_badges cascade;
drop table if exists public.child_stage_progress cascade;
drop table if exists public.child_lesson_progress cascade;
drop table if exists public.child_profiles cascade;
drop table if exists public.exercise_questions cascade;
drop table if exists public.stage_exercises cascade;
drop table if exists public.lessons cascade;
drop table if exists public.stages cascade;
drop table if exists public.levels cascade;
drop table if exists public.user_progress cascade;
drop table if exists public.exercises cascade;
drop table if exists public.contact_messages cascade;
drop function if exists public.list_lessons(text);

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- `users` already exists from v1 — created here with `if not exists` so this
-- script also works on a truly fresh project, then upgraded via ALTER below
-- either way (both are safe no-ops if already applied).
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'active', 'past_due', 'canceled')),
  subscription_plan text check (subscription_plan in ('monthly', 'annual')),
  subscription_tier text not null default 'standard' check (subscription_tier in ('standard', 'family')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  stripe_last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade path from v1 (table already existed without subscription_tier, and
-- with child_name/age_group — those move to child_profiles instead).
alter table public.users add column if not exists subscription_tier text not null default 'standard';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_subscription_tier_check') then
    alter table public.users add constraint users_subscription_tier_check check (subscription_tier in ('standard', 'family'));
  end if;
end $$;
alter table public.users drop column if exists child_name;
alter table public.users drop column if exists age_group;

create table public.levels (
  id serial primary key,
  name text not null,
  order_index int not null unique,
  description text
);

create table public.stages (
  id serial primary key,
  level_id int not null references public.levels(id),
  name text not null,
  order_index int not null unique, -- global 1-16 ordering across the whole curriculum
  video_url text, -- cartoon summary video; null until content production (later workstream)
  mastery_threshold int not null default 70,
  -- Manual-placement age floor: a parent can only place a child at this stage
  -- (or the age-ceiling logic can only recommend it) if the child is at
  -- least this age. Stand-in for the full adaptive placement test.
  min_placement_age int not null default 3,
  is_free boolean not null default false -- Stage 1 = true; "try before you buy"
);

create table public.lessons (
  id serial primary key,
  stage_id int not null references public.stages(id),
  order_index int not null,
  title text not null,
  lesson_goal text not null,
  arabic_word text not null,
  arabic_word_meaning text not null,
  content jsonb not null,
  is_free boolean not null default false,
  estimated_minutes int not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage_id, order_index)
);

-- One row per checkpoint within a stage. The highest checkpoint_order for a
-- given stage is that stage's mastery exercise — passing it advances
-- child_profiles.current_stage_id and unlocks the next stage (+ its video).
create table public.stage_exercises (
  id serial primary key,
  stage_id int not null references public.stages(id) on delete cascade,
  checkpoint_order int not null,
  is_mastery boolean not null default false,
  unique (stage_id, checkpoint_order)
);

create table public.exercise_questions (
  id serial primary key,
  stage_exercise_id int not null references public.stage_exercises(id) on delete cascade,
  question_number int not null,
  title text not null,
  instruction text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

-- A child is a profile under a parent account, not fields on the parent's
-- own row — this is what makes multiple children per subscription possible.
create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  date_of_birth date,
  current_stage_id int references public.stages(id),
  -- Age-ceiling cap: highest stage this child may ever be placed/advanced
  -- into regardless of test/manual override. Null = no cap applied yet.
  max_stage_id int references public.stages(id),
  current_streak int not null default 0,
  longest_streak int not null default 0,
  created_at timestamptz not null default now()
);

create table public.child_lesson_progress (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  lesson_id int not null references public.lessons(id) on delete cascade,
  score int default 0,
  completed_at timestamptz,
  attempts int not null default 0,
  last_attempt_at timestamptz,
  unique (child_id, lesson_id)
);

create table public.child_stage_progress (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  stage_id int not null references public.stages(id) on delete cascade,
  mastery_passed_at timestamptz,
  video_watched_at timestamptz,
  badge_earned_at timestamptz,
  unique (child_id, stage_id)
);

-- Milestone badges that don't map to a single stage (lesson-count and streak
-- milestones, level graduations). Per-stage "mastered" badges reuse
-- child_stage_progress.badge_earned_at above instead of a row here. The
-- badge catalog (name/description/icon per code) is a static frontend
-- constant (frontend/src/lib/badges.js) — no admin-editability requirement,
-- so it doesn't need its own table.
create table public.child_badges (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  unique (child_id, badge_code)
);

-- One diagnostic question per stage (16 rows), each testing the core skill
-- that stage teaches. The placement test bisects over these by order_index
-- rather than asking all 16 — see nextPlacementStep() in
-- frontend/src/lib/db.js.
create table public.placement_questions (
  id serial primary key,
  stage_id int not null references public.stages(id),
  instruction text not null,
  options jsonb not null,
  correct_answer text not null
);

create table public.placement_results (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  raw_answers jsonb,
  placed_stage_id int references public.stages(id),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_stages_level on public.stages(level_id);
create index idx_lessons_stage on public.lessons(stage_id);
create index idx_stage_exercises_stage on public.stage_exercises(stage_id);
create index idx_exercise_questions_stage_exercise on public.exercise_questions(stage_exercise_id);
create index idx_child_profiles_parent on public.child_profiles(parent_id);
create index idx_placement_questions_stage on public.placement_questions(stage_id);
create index idx_child_badges_child on public.child_badges(child_id);
create index idx_child_lesson_progress_child on public.child_lesson_progress(child_id);
create index idx_child_lesson_progress_lesson on public.child_lesson_progress(lesson_id);
create index idx_child_stage_progress_child on public.child_stage_progress(child_id);
create index idx_placement_results_child on public.placement_results(child_id);

-- ---------------------------------------------------------------------------
-- Auto-create a public.users profile row whenever someone signs up via
-- Supabase Auth. Child profiles are created separately (a distinct step
-- after signup), not via this trigger.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.levels enable row level security;
alter table public.stages enable row level security;
alter table public.lessons enable row level security;
alter table public.stage_exercises enable row level security;
alter table public.exercise_questions enable row level security;
alter table public.child_profiles enable row level security;
alter table public.child_lesson_progress enable row level security;
alter table public.child_stage_progress enable row level security;
alter table public.child_badges enable row level security;
alter table public.placement_questions enable row level security;
alter table public.placement_results enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_entitled()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and subscription_status = 'active'
  );
$$;

create or replace function public.owns_child(p_child_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.child_profiles where id = p_child_id and parent_id = auth.uid()
  );
$$;

-- USERS (table isn't dropped/recreated like the others, so its policies need
-- an explicit drop-if-exists first to stay re-runnable).
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "users_update" on public.users;
create policy "users_update" on public.users for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- LEVELS / STAGES: curriculum structure is public (needed to browse the
-- Lesson Hub's Level -> Stage map) — no lesson content or answers live here.
create policy "levels_select_all" on public.levels for select using (true);
create policy "levels_admin_write" on public.levels for all
  using (public.is_admin()) with check (public.is_admin());

create policy "stages_select_all" on public.stages for select using (true);
create policy "stages_admin_write" on public.stages for all
  using (public.is_admin()) with check (public.is_admin());

-- LESSONS: same free-row-vs-entitled gate as v1. Locked lesson content
-- (including exercise answer keys) never reaches the client this way — the
-- Lesson Hub uses the list_stage_lessons() RPC below for the full
-- locked/free/completed listing instead.
create policy "lessons_select_entitled" on public.lessons for select
  using (is_free = true or public.is_admin() or public.is_entitled());
create policy "lessons_admin_insert" on public.lessons for insert
  with check (public.is_admin());
create policy "lessons_admin_update" on public.lessons for update
  using (public.is_admin()) with check (public.is_admin());
create policy "lessons_admin_delete" on public.lessons for delete
  using (public.is_admin());

-- STAGE_EXERCISES / EXERCISE_QUESTIONS inherit entitlement via their stage.
create policy "stage_exercises_select_entitled" on public.stage_exercises for select
  using (
    exists (
      select 1 from public.stages s
      where s.id = stage_exercises.stage_id
        and (s.is_free or public.is_admin() or public.is_entitled())
    )
  );
create policy "stage_exercises_admin_write" on public.stage_exercises for all
  using (public.is_admin()) with check (public.is_admin());

create policy "exercise_questions_select_entitled" on public.exercise_questions for select
  using (
    exists (
      select 1 from public.stage_exercises se
      join public.stages s on s.id = se.stage_id
      where se.id = exercise_questions.stage_exercise_id
        and (s.is_free or public.is_admin() or public.is_entitled())
    )
  );
create policy "exercise_questions_admin_write" on public.exercise_questions for all
  using (public.is_admin()) with check (public.is_admin());

-- CHILD_PROFILES: a parent manages only their own children; admins see all
-- (AdminUsers shows children per account).
create policy "child_profiles_select" on public.child_profiles for select
  using (parent_id = auth.uid() or public.is_admin());
create policy "child_profiles_insert" on public.child_profiles for insert
  with check (parent_id = auth.uid());
create policy "child_profiles_update" on public.child_profiles for update
  using (parent_id = auth.uid() or public.is_admin())
  with check (parent_id = auth.uid() or public.is_admin());
create policy "child_profiles_delete" on public.child_profiles for delete
  using (parent_id = auth.uid() or public.is_admin());

-- Standard tier: 1 child max. Family: uncapped for now (see plan notes —
-- no ceiling was specified; revisit once pricing is finalized).
create or replace function public.enforce_child_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tier text;
  existing_count int;
begin
  select subscription_tier into tier from public.users where id = new.parent_id;
  select count(*) into existing_count from public.child_profiles where parent_id = new.parent_id;
  if coalesce(tier, 'standard') = 'standard' and existing_count >= 1 then
    raise exception 'Standard plan allows only 1 child profile. Upgrade to Family to add more.';
  end if;
  return new;
end;
$$;

drop trigger if exists child_profile_limit_check on public.child_profiles;
create trigger child_profile_limit_check
  before insert on public.child_profiles
  for each row execute function public.enforce_child_limit();

-- CHILD_LESSON_PROGRESS: parent manages only their own children's rows;
-- insert further requires the lesson actually be free/entitled, so a locked
-- lesson can't be marked complete by calling the API directly.
create policy "child_lesson_progress_select" on public.child_lesson_progress for select
  using (public.owns_child(child_id) or public.is_admin());
create policy "child_lesson_progress_insert" on public.child_lesson_progress for insert
  with check (
    public.owns_child(child_id)
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id
        and (l.is_free or public.is_admin() or public.is_entitled())
    )
  );
create policy "child_lesson_progress_update" on public.child_lesson_progress for update
  using (public.owns_child(child_id))
  with check (public.owns_child(child_id));

-- CHILD_STAGE_PROGRESS
create policy "child_stage_progress_select" on public.child_stage_progress for select
  using (public.owns_child(child_id) or public.is_admin());
create policy "child_stage_progress_insert" on public.child_stage_progress for insert
  with check (public.owns_child(child_id));
create policy "child_stage_progress_update" on public.child_stage_progress for update
  using (public.owns_child(child_id))
  with check (public.owns_child(child_id));

-- CHILD_BADGES
create policy "child_badges_select" on public.child_badges for select
  using (public.owns_child(child_id) or public.is_admin());
create policy "child_badges_insert" on public.child_badges for insert
  with check (public.owns_child(child_id));

-- PLACEMENT_QUESTIONS: public read including correct_answer (same trust level
-- as the age-based manual stage picker it replaces — a parent could already
-- freely pick any stage for their child, so there's no real gate to protect
-- here, unlike real lesson/checkpoint content).
create policy "placement_questions_select_all" on public.placement_questions for select using (true);
create policy "placement_questions_admin_write" on public.placement_questions for all
  using (public.is_admin()) with check (public.is_admin());

-- PLACEMENT_RESULTS
create policy "placement_results_select" on public.placement_results for select
  using (public.owns_child(child_id) or public.is_admin());
create policy "placement_results_insert" on public.placement_results for insert
  with check (public.owns_child(child_id));

-- CONTACT_MESSAGES: anyone (including anonymous visitors) can submit; only
-- admins can read the inbox or mark a message handled.
create policy "contact_insert" on public.contact_messages for insert
  with check (true);
create policy "contact_select_admin" on public.contact_messages for select
  using (public.is_admin());
create policy "contact_update_admin" on public.contact_messages for update
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC: per-stage lesson listing (id/title/is_free/etc only — no content, no
-- exercises) so the Lesson Hub can render locked/free/completed states for
-- every lesson in a stage without granting row access to paid content.
-- ---------------------------------------------------------------------------

create or replace function public.list_stage_lessons(p_stage_id int)
returns table (
  id int,
  stage_id int,
  order_index int,
  title text,
  arabic_word text,
  is_free boolean,
  estimated_minutes int
)
language sql
security definer
set search_path = public
stable
as $$
  select id, stage_id, order_index, title, arabic_word, is_free, estimated_minutes
  from public.lessons
  where stage_id = p_stage_id
  order by order_index;
$$;

grant execute on function public.list_stage_lessons(int) to anon, authenticated;
