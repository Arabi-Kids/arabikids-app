-- Additive migration for the LIVE project - creates the "Qur'an & Knowledge
-- Extras" pillar's real data model. Today all Qur'an-specific content
-- (word-anchor citations, progressive ayah recitation, whole-surah fluency
-- checks) lives embedded inside Arabic Curriculum lessons.content jsonb;
-- this migration adds a parallel, independent home for it so the Arabic
-- Curriculum can become a standalone language track. Purely additive - does
-- not touch the lessons table. A separate one-time script
-- (scripts/migrate-quran-pillar.mjs) populates these tables from the live
-- lessons data after this migration runs; a later script strips the
-- now-duplicated fields out of lessons.content once the new pillar is
-- verified live. Run once in the Supabase SQL Editor.

create table public.quran_surahs (
  surah_number int primary key,
  name text not null,
  name_arabic text,
  total_ayahs int not null
);

create table public.quran_ayahs (
  id serial primary key,
  surah_number int not null references public.quran_surahs(surah_number),
  ayah_number int not null,
  arabic text not null,
  transliteration text,
  translation text,
  translation_ar text,
  translation_ms text,
  unique (surah_number, ayah_number)
);

-- The pillar's "lesson"-equivalent unit. Independent order_index/sequence
-- from the 16-stage Arabic Curriculum (full separation, not a mirrored
-- structure) - 'surah_corner' units teach one new ayah at a time
-- (cumulative_through tracks how many ayahs the child can recite so far);
-- 'fluency_check' units are the "recite the whole surah" capstones.
create table public.quran_units (
  id serial primary key,
  order_index int not null unique,
  unit_type text not null check (unit_type in ('surah_corner', 'fluency_check')),
  surah_number int not null references public.quran_surahs(surah_number),
  title text not null,
  title_ar text,
  title_ms text,
  ayah_number int,
  cumulative_through int,
  ayah_range_start int,
  ayah_range_end int,
  is_free boolean not null default false,
  estimated_minutes int not null default 5,
  created_at timestamptz not null default now()
);

-- The migrated per-lesson "this word appears in the Quran here" citations
-- (one per Arabic Curriculum lesson today). source_lesson_id preserves the
-- pedagogical link back to the word/lesson that originally taught it -
-- nullable + set null on delete so a future lesson deletion never
-- cascade-deletes Quran content.
create table public.quran_word_connections (
  id serial primary key,
  source_lesson_id int references public.lessons(id) on delete set null,
  arabic_word text not null,
  word_meaning text not null,
  arabic_citation text not null,
  translation text not null,
  translation_ar text,
  translation_ms text,
  reference text not null,
  note text,
  note_ar text,
  note_ms text,
  surah_number int references public.quran_surahs(surah_number),
  ayah_number int,
  order_index int not null,
  created_at timestamptz not null default now()
);

-- Per-child progress on quran_units, same shape as child_lesson_progress.
create table public.child_quran_progress (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  quran_unit_id int not null references public.quran_units(id) on delete cascade,
  score int default 0,
  completed_at timestamptz,
  attempts int not null default 0,
  last_attempt_at timestamptz,
  unique (child_id, quran_unit_id)
);

create index idx_quran_ayahs_surah on public.quran_ayahs(surah_number);
create index idx_quran_units_surah on public.quran_units(surah_number);
create index idx_quran_word_connections_lesson on public.quran_word_connections(source_lesson_id);
create index idx_child_quran_progress_child on public.child_quran_progress(child_id);

alter table public.quran_surahs enable row level security;
alter table public.quran_ayahs enable row level security;
alter table public.quran_units enable row level security;
alter table public.quran_word_connections enable row level security;
alter table public.child_quran_progress enable row level security;

-- Reference data (surah/ayah facts) is public read, admin write - same
-- pattern as levels/stages.
create policy "quran_surahs_select_all" on public.quran_surahs for select using (true);
create policy "quran_surahs_admin_write" on public.quran_surahs for all using (public.is_admin()) with check (public.is_admin());

create policy "quran_ayahs_select_all" on public.quran_ayahs for select using (true);
create policy "quran_ayahs_admin_write" on public.quran_ayahs for all using (public.is_admin()) with check (public.is_admin());

-- Units are paywall-gated exactly like lessons (is_free flag + subscription).
create policy "quran_units_select_entitled" on public.quran_units for select
  using (is_free = true or public.is_admin() or public.is_entitled());
create policy "quran_units_admin_write" on public.quran_units for all using (public.is_admin()) with check (public.is_admin());

-- Word connections are short single-citation cards - free/public, same
-- top-of-funnel logic as Stage 1 being free.
create policy "quran_word_connections_select_all" on public.quran_word_connections for select using (true);
create policy "quran_word_connections_admin_write" on public.quran_word_connections for all using (public.is_admin()) with check (public.is_admin());

create policy "child_quran_progress_select" on public.child_quran_progress for select
  using (public.owns_child(child_id) or public.is_admin());
create policy "child_quran_progress_insert" on public.child_quran_progress for insert
  with check (public.owns_child(child_id) and exists (
    select 1 from public.quran_units u where u.id = quran_unit_id and (u.is_free or public.is_admin() or public.is_entitled())
  ));
create policy "child_quran_progress_update" on public.child_quran_progress for update
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
