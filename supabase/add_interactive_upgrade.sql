-- Additive migration for the "interactive upgrade": characters, reviewed
-- content store, audio manifest, stickers, intro-seen and per-child content
-- progress. Purely additive - does not touch levels/stages/lessons. Run once
-- in the Supabase SQL Editor, then run `node scripts/import-content-pack.mjs`
-- to load arabikids-content-pack-draft.md as `draft` rows.
--
-- Why content_items instead of "existing level/stage/lesson tables with a
-- pillar_id" (spec section 5): stages.order_index is globally unique 1-16 and
-- child_profiles.current_stage_id advances by order_index, so 9 Practical Life
-- stages there would sit "after" Stage 16 of the Arabic Curriculum and leak
-- into placement, age-ceiling and "16 stages" logic. The Qur'an pillar made
-- the same call (independent tables). Stage gating/paywall semantics are
-- reused (is_free + is_entitled()), just not the physical tables.

-- ---------------------------------------------------------------------------
-- characters: mirrors frontend/src/lib/characters.config.js (the config file
-- is what the UI reads; this table is the queryable copy for admin tooling).
-- ---------------------------------------------------------------------------
create table if not exists public.characters (
  id text primary key,
  name text not null,
  role text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.characters (id, name, role, config) values
  ('hudi', 'Hudi', 'Main guide for the Arabic Curriculum', '{"kind":"hoopoe"}'),
  ('amir', 'Amir', 'Demonstrates wudu, prayer and duas (boy profile)', '{"kind":"boy"}'),
  ('nur',  'Nur',  'Demonstrates wudu, prayer and duas (girl profile)', '{"kind":"girl"}')
on conflict (id) do nothing;

-- Which character demonstrates Practical Life for this child (boy -> amir,
-- girl -> nur). Null until the parent/child picks; the UI asks once.
alter table public.child_profiles
  add column if not exists demonstrator text check (demonstrator in ('amir', 'nur'));

-- ---------------------------------------------------------------------------
-- content_items: every reviewed content row from the content pack (letters,
-- positions, host lines, wudu, prayer, duas...). `data` holds the pack's
-- columns verbatim (normalised keys); the Arabic is never edited.
-- ---------------------------------------------------------------------------
create table if not exists public.content_items (
  id text primary key,                       -- 'L01', 'WD-01', 'DU-07', 'FAT-1'...
  kind text not null,                        -- letter, position, wudu_step, dua...
  stage_no int,                              -- Practical Life stage 1-9 (null otherwise)
  order_index int not null default 0,
  is_free boolean not null default false,
  label text,                                -- short display label usable in locked cards
  sublabel text,                             -- secondary label (e.g. the letter's name)
  data jsonb not null,
  review_status text not null default 'draft' check (review_status in ('draft', 'review', 'approved')),
  review_note text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_items_kind on public.content_items(kind, order_index);
create index if not exists idx_content_items_stage on public.content_items(stage_no);

-- ---------------------------------------------------------------------------
-- audio_assets: manifest. The app only ever plays rows with status =
-- 'approved'. `script_text` is the exact text to synthesise offline.
-- ---------------------------------------------------------------------------
create table if not exists public.audio_assets (
  id text primary key,                       -- audio_id, e.g. 'L01.name.ar'
  content_ref text,                          -- content_items.id (no FK: SFX etc. have none)
  language text not null check (language in ('ar', 'en', 'ms', 'sfx')),
  source_type text not null check (source_type in ('voicestudio', 'human', 'licensed', 'sfx')),
  script_text text,
  file_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  notes text,
  license_note text,
  timings_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audio_assets_status on public.audio_assets(status);
create index if not exists idx_audio_assets_content on public.audio_assets(content_ref);

-- ---------------------------------------------------------------------------
-- Per-child tables
-- ---------------------------------------------------------------------------
create table if not exists public.child_content_progress (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  item_id text not null references public.content_items(id) on delete cascade,
  score int default 0,
  completed_at timestamptz,
  attempts int not null default 0,
  last_attempt_at timestamptz,
  unique (child_id, item_id)
);

create table if not exists public.sticker_book (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  sticker_id text not null,
  earned_at timestamptz not null default now(),
  unique (child_id, sticker_id)
);

create table if not exists public.intro_seen (
  id serial primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  intro_id text not null,
  seen_at timestamptz not null default now(),
  unique (child_id, intro_id)
);

create index if not exists idx_child_content_progress_child on public.child_content_progress(child_id);
create index if not exists idx_sticker_book_child on public.sticker_book(child_id);
create index if not exists idx_intro_seen_child on public.intro_seen(child_id);

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_items_touch on public.content_items;
create trigger content_items_touch before update on public.content_items
  for each row execute function public.touch_updated_at();
drop trigger if exists audio_assets_touch on public.audio_assets;
create trigger audio_assets_touch before update on public.audio_assets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.characters enable row level security;
alter table public.content_items enable row level security;
alter table public.audio_assets enable row level security;
alter table public.child_content_progress enable row level security;
alter table public.sticker_book enable row level security;
alter table public.intro_seen enable row level security;

drop policy if exists "characters_select_all" on public.characters;
create policy "characters_select_all" on public.characters for select using (true);
drop policy if exists "characters_admin_write" on public.characters;
create policy "characters_admin_write" on public.characters for all
  using (public.is_admin()) with check (public.is_admin());

-- Children only ever see APPROVED items, and only free ones unless the
-- account is entitled. Admins see everything (this is how draft preview works).
drop policy if exists "content_items_select" on public.content_items;
create policy "content_items_select" on public.content_items for select
  using (
    public.is_admin()
    or (review_status = 'approved' and (is_free or public.is_entitled()))
  );
drop policy if exists "content_items_admin_write" on public.content_items;
create policy "content_items_admin_write" on public.content_items for all
  using (public.is_admin()) with check (public.is_admin());

-- Audio: approved clips are readable by anyone (UI chrome plays pre-login
-- too); the manifest's pending/rejected rows are admin-only.
drop policy if exists "audio_assets_select" on public.audio_assets;
create policy "audio_assets_select" on public.audio_assets for select
  using (status = 'approved' or public.is_admin());
drop policy if exists "audio_assets_admin_write" on public.audio_assets;
create policy "audio_assets_admin_write" on public.audio_assets for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "child_content_progress_select" on public.child_content_progress;
create policy "child_content_progress_select" on public.child_content_progress for select
  using (public.owns_child(child_id) or public.is_admin());
drop policy if exists "child_content_progress_insert" on public.child_content_progress;
create policy "child_content_progress_insert" on public.child_content_progress for insert
  with check (
    public.owns_child(child_id)
    and exists (
      select 1 from public.content_items c
      where c.id = item_id and (c.is_free or public.is_admin() or public.is_entitled())
    )
  );
drop policy if exists "child_content_progress_update" on public.child_content_progress;
create policy "child_content_progress_update" on public.child_content_progress for update
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "sticker_book_select" on public.sticker_book;
create policy "sticker_book_select" on public.sticker_book for select
  using (public.owns_child(child_id) or public.is_admin());
drop policy if exists "sticker_book_insert" on public.sticker_book;
create policy "sticker_book_insert" on public.sticker_book for insert
  with check (public.owns_child(child_id));

drop policy if exists "intro_seen_select" on public.intro_seen;
create policy "intro_seen_select" on public.intro_seen for select
  using (public.owns_child(child_id) or public.is_admin());
drop policy if exists "intro_seen_insert" on public.intro_seen;
create policy "intro_seen_insert" on public.intro_seen for insert
  with check (public.owns_child(child_id));

-- ---------------------------------------------------------------------------
-- RPC: index of APPROVED items (no `data`), so hubs can render locked cards
-- for paywalled content without granting row access to it - same pattern as
-- list_stage_lessons().
-- ---------------------------------------------------------------------------
create or replace function public.list_content_index(p_kind text default null)
returns table (
  id text,
  kind text,
  stage_no int,
  order_index int,
  is_free boolean,
  label text,
  sublabel text
)
language sql
security definer
set search_path = public
stable
as $$
  select id, kind, stage_no, order_index, is_free, label, sublabel
  from public.content_items
  where review_status = 'approved'
    and (p_kind is null or kind = p_kind)
  order by kind, order_index;
$$;

grant execute on function public.list_content_index(text) to anon, authenticated;
