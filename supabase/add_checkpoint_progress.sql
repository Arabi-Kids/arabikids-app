-- Additive migration for the LIVE project - adds child_checkpoint_progress,
-- tracking every checkpoint attempt (not just the stage-mastery one).
-- child_stage_progress.mastery_passed_at already covers the FINAL checkpoint
-- of a stage, but periodic (every-3-lessons) checkpoint passes were never
-- persisted anywhere - this is needed so the post-checkpoint recap card can
-- be gated/revisited later. Safe to run now even with real data in the DB -
-- adds one table, touches nothing else. Run once in the Supabase SQL Editor.

create table if not exists public.child_checkpoint_progress (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  stage_exercise_id int not null references public.stage_exercises(id) on delete cascade,
  score int not null,
  passed_at timestamptz,
  attempted_at timestamptz not null default now(),
  unique (child_id, stage_exercise_id)
);

create index if not exists idx_child_checkpoint_progress_child on public.child_checkpoint_progress(child_id);

alter table public.child_checkpoint_progress enable row level security;

drop policy if exists "child_checkpoint_progress_select" on public.child_checkpoint_progress;
create policy "child_checkpoint_progress_select" on public.child_checkpoint_progress for select
  using (public.owns_child(child_id) or public.is_admin());

drop policy if exists "child_checkpoint_progress_insert" on public.child_checkpoint_progress;
create policy "child_checkpoint_progress_insert" on public.child_checkpoint_progress for insert
  with check (public.owns_child(child_id));

drop policy if exists "child_checkpoint_progress_update" on public.child_checkpoint_progress;
create policy "child_checkpoint_progress_update" on public.child_checkpoint_progress for update
  using (public.owns_child(child_id));
