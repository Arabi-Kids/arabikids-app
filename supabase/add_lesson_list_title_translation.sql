-- Additive migration for the LIVE project - makes the stage lesson-list RPC
-- language-aware. list_stage_lessons() is a security-definer function that
-- bypasses lessons' RLS entitlement policy so a child sees every lesson's
-- title/metadata in a stage (including locked/paywalled ones), not just the
-- free ones a plain client-side select would return. It only ever selected
-- the English `title` column, so the lesson list inside a stage
-- (StageLessons.jsx) stayed English regardless of site language, even
-- though the lesson detail page itself (getLessonDetail) was already
-- localized via lessons.content_ar/content_ms.
--
-- Adds title_ar/title_ms output columns, read from the same
-- content_ar->>'title' / content_ms->>'title' override each lesson's
-- translated blob already carries (see add_language_preference.sql).
-- Postgres doesn't allow CREATE OR REPLACE to change a function's output
-- column list, so this drops and recreates it - safe, no data involved,
-- just re-declares the same read-only query with two extra columns. Run
-- once in the Supabase SQL Editor.

drop function if exists public.list_stage_lessons(int);

create function public.list_stage_lessons(p_stage_id int)
returns table (
  id int,
  stage_id int,
  order_index int,
  title text,
  title_ar text,
  title_ms text,
  arabic_word text,
  is_free boolean,
  estimated_minutes int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    id, stage_id, order_index, title,
    content_ar->>'title' as title_ar,
    content_ms->>'title' as title_ms,
    arabic_word, is_free, estimated_minutes
  from public.lessons
  where stage_id = p_stage_id
  order by order_index;
$$;

grant execute on function public.list_stage_lessons(int) to anon, authenticated;
