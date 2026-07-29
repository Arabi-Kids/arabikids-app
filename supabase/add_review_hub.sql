-- Additive migration for the LIVE project - adds the tables backing the
-- Stage Review Hub (Watch & Learn / My Vocabulary / Read / Write / Practice /
-- Play). All three tables are new; nothing existing is touched. Safe to run
-- now even with real data in the DB. Run once in the Supabase SQL Editor.

create table if not exists public.stage_vocabulary_favorites (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  lesson_id int not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (child_id, lesson_id)
);

create table if not exists public.stage_reading_passages (
  id serial primary key,
  stage_id int not null references public.stages(id) on delete cascade,
  order_index int not null,
  text_content text not null,
  translation text not null,
  unique (stage_id, order_index)
);

-- Engagement logging only for the Review Hub's Practice/Play tabs (and tab
-- opens generally) - never read by any progress-gating logic. score is
-- nullable since My Vocabulary/Read/Watch tab-opens aren't "scored" events.
create table if not exists public.review_activity (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  stage_id int not null references public.stages(id) on delete cascade,
  tab_type text not null check (tab_type in ('watch', 'vocabulary', 'read', 'write', 'practice', 'play')),
  score int,
  created_at timestamptz not null default now()
);
create index if not exists idx_review_activity_child_stage on public.review_activity(child_id, stage_id);

alter table public.stage_vocabulary_favorites enable row level security;
alter table public.stage_reading_passages enable row level security;
alter table public.review_activity enable row level security;

drop policy if exists "stage_vocabulary_favorites_select" on public.stage_vocabulary_favorites;
create policy "stage_vocabulary_favorites_select" on public.stage_vocabulary_favorites for select
  using (public.owns_child(child_id) or public.is_admin());

drop policy if exists "stage_vocabulary_favorites_insert" on public.stage_vocabulary_favorites;
create policy "stage_vocabulary_favorites_insert" on public.stage_vocabulary_favorites for insert
  with check (public.owns_child(child_id));

drop policy if exists "stage_vocabulary_favorites_delete" on public.stage_vocabulary_favorites;
create policy "stage_vocabulary_favorites_delete" on public.stage_vocabulary_favorites for delete
  using (public.owns_child(child_id));

-- Reading passages are curriculum content - same entitlement gating as
-- stage_exercises/exercise_questions (free stage, or admin, or a paid
-- subscriber), not a bare "true" - matches schema.sql's existing pattern.
drop policy if exists "stage_reading_passages_select" on public.stage_reading_passages;
create policy "stage_reading_passages_select" on public.stage_reading_passages for select
  using (
    exists (
      select 1 from public.stages s
      where s.id = stage_reading_passages.stage_id
        and (s.is_free or public.is_admin() or public.is_entitled())
    )
  );

drop policy if exists "review_activity_select" on public.review_activity;
create policy "review_activity_select" on public.review_activity for select
  using (public.owns_child(child_id) or public.is_admin());

drop policy if exists "review_activity_insert" on public.review_activity;
create policy "review_activity_insert" on public.review_activity for insert
  with check (public.owns_child(child_id));
