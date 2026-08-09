-- Additive migration for the LIVE project - adds Arabic/Malay translations
-- for the placement quiz (frontend/src/pages/AddChild.jsx's "Take the
-- Placement Quiz" step), which was still English-only after the rest of
-- the site was localized.
--
-- instruction_ar / instruction_ms: translated question text, nullable -
-- falls back to `instruction` (English) if not yet translated, same
-- pattern as lessons.content_ar/content_ms.
--
-- options_ar / options_ms: translated option arrays, same order/length as
-- `options` so they line up positionally.
--
-- correct_index: which position in `options` (0-based) is correct. Replaces
-- text-equality matching against `correct_answer` - once options are
-- localized, the child taps a translated option string, which can no
-- longer be compared against the English `correct_answer` text. Matching
-- by index works regardless of which language's option array is shown.
-- `correct_answer` (English text) is left in place as a human-readable
-- reference column, no longer read by the app.
--
-- Safe to run now - four nullable/backfillable columns, touches nothing
-- else. Run once in the Supabase SQL Editor.

alter table public.placement_questions add column if not exists instruction_ar text;
alter table public.placement_questions add column if not exists instruction_ms text;
alter table public.placement_questions add column if not exists options_ar jsonb;
alter table public.placement_questions add column if not exists options_ms jsonb;
alter table public.placement_questions add column if not exists correct_index int;

update public.placement_questions
set correct_index = (
  select pos - 1
  from jsonb_array_elements_text(options) with ordinality as opt(value, pos)
  where opt.value = correct_answer
  limit 1
)
where correct_index is null;
