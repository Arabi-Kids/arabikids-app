-- Additive migration for the LIVE project - adds Arabic/Malay translations
-- for level and stage names/descriptions, which were still English-only:
-- `levels.name`/`description` and `stages.name`/`intro_kids`/`intro_parents`
-- have never had translated counterparts, so every stage name and intro
-- blurb kept showing in English regardless of the site's chosen language.
--
-- Nullable, same pattern as lessons.content_ar/content_ms - falls back to
-- the English column when a translation is missing.
--
-- Safe to run now - six nullable columns, touches nothing else. Run once
-- in the Supabase SQL Editor.

alter table public.levels add column if not exists name_ar text;
alter table public.levels add column if not exists name_ms text;
alter table public.levels add column if not exists description_ar text;
alter table public.levels add column if not exists description_ms text;

alter table public.stages add column if not exists name_ar text;
alter table public.stages add column if not exists name_ms text;
alter table public.stages add column if not exists intro_kids_ar text;
alter table public.stages add column if not exists intro_kids_ms text;
alter table public.stages add column if not exists intro_parents_ar text;
alter table public.stages add column if not exists intro_parents_ms text;
