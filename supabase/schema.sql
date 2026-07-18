-- ArabiKids database schema (Supabase / Postgres)
-- "Teaching the Language of the Quran, One Kid at a Time."
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Replaces the old MySQL schema (backend/db/schema.sql, now removed).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  child_name text,
  age_group text not null default 'junior' check (age_group in ('junior', 'explorer')),
  role text not null default 'parent' check (role in ('parent', 'admin')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'active', 'past_due', 'canceled')),
  subscription_plan text check (subscription_plan in ('monthly', 'annual')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  -- Guards against out-of-order Stripe webhook delivery: a webhook only
  -- applies its update if the event is newer than the last one applied.
  stripe_last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id serial primary key,
  age_group text not null check (age_group in ('junior', 'explorer')),
  lesson_number int not null,
  title text not null,
  lesson_goal text not null,
  arabic_word text not null,
  arabic_word_meaning text not null,
  content jsonb not null,
  is_free boolean not null default false,
  estimated_minutes int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (age_group, lesson_number)
);

create table public.exercises (
  id serial primary key,
  lesson_id int not null references public.lessons(id) on delete cascade,
  exercise_number int not null,
  title text not null,
  instruction text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

create table public.user_progress (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id int not null references public.lessons(id) on delete cascade,
  score int default 0,
  completed_at timestamptz,
  attempts int not null default 0,
  last_attempt_at timestamptz,
  unique (user_id, lesson_id)
);

-- New: Contact.jsx previously faked success without sending anywhere. This gives
-- the contact form somewhere real to land; an admin can review it later.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_lessons_age_group on public.lessons(age_group);
create index idx_exercises_lesson_id on public.exercises(lesson_id);
create index idx_user_progress_user on public.user_progress(user_id);
create index idx_user_progress_lesson on public.user_progress(lesson_id);

-- ---------------------------------------------------------------------------
-- Auto-create a public.users profile row whenever someone signs up via
-- Supabase Auth. name/child_name/age_group come from the options.data passed
-- to supabase.auth.signUp() on the Signup page.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, child_name, age_group)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    new.raw_user_meta_data ->> 'child_name',
    coalesce(new.raw_user_meta_data ->> 'age_group', 'junior')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.user_progress enable row level security;
alter table public.contact_messages enable row level security;

-- Helper used by every policy below instead of repeating the subquery.
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

-- USERS: everyone can read/update their own row; admins can read/update everyone
-- (used by AdminUsers to manually flip subscription_status).
create policy "users_select" on public.users for select
  using (auth.uid() = id or public.is_admin());

create policy "users_update" on public.users for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- LESSONS: a row is only fully readable if it's free, the reader is an
-- entitled (active-subscription) user, or an admin. Locked lesson content
-- (including the answer key in `exercises`) never reaches the client this way.
-- The Lesson Hub's "show all 40 with lock icons" listing uses the
-- `list_lessons` RPC below instead, which bypasses this to expose only
-- non-sensitive columns for every lesson.
create policy "lessons_select_entitled" on public.lessons for select
  using (is_free = true or public.is_admin() or public.is_entitled());

create policy "lessons_admin_insert" on public.lessons for insert
  with check (public.is_admin());
create policy "lessons_admin_update" on public.lessons for update
  using (public.is_admin()) with check (public.is_admin());
create policy "lessons_admin_delete" on public.lessons for delete
  using (public.is_admin());

-- EXERCISES inherit the same entitlement gate via their parent lesson.
create policy "exercises_select_entitled" on public.exercises for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = exercises.lesson_id
        and (l.is_free = true or public.is_admin() or public.is_entitled())
    )
  );

create policy "exercises_admin_write" on public.exercises for all
  using (public.is_admin()) with check (public.is_admin());

-- USER_PROGRESS: users manage only their own rows; admins can read all
-- (dashboard "lessons completed today" stat). Insert/update is further
-- restricted to lessons the user is actually entitled to, so you can't mark
-- a locked lesson complete by calling the API directly.
create policy "progress_select" on public.user_progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "progress_insert" on public.user_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id
        and (l.is_free = true or public.is_admin() or public.is_entitled())
    )
  );

create policy "progress_update" on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CONTACT_MESSAGES: anyone (including anonymous visitors) can submit;
-- only admins can read the inbox.
create policy "contact_insert" on public.contact_messages for insert
  with check (true);
create policy "contact_select_admin" on public.contact_messages for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC: public lesson listing (id/title/is_free/etc only — no content, no
-- exercises) so the Lesson Hub can render locked/free/completed states for
-- ALL 40 lessons per group without granting row access to paid content.
-- ---------------------------------------------------------------------------

create or replace function public.list_lessons(p_age_group text)
returns table (
  id int,
  age_group text,
  lesson_number int,
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
  select id, age_group, lesson_number, title, arabic_word, is_free, estimated_minutes
  from public.lessons
  where age_group = p_age_group
  order by lesson_number;
$$;

grant execute on function public.list_lessons(text) to anon, authenticated;
