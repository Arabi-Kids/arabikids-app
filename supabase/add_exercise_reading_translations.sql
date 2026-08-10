-- Additive migration for the LIVE project - adds Arabic/Malay translations
-- for checkpoint/practice quiz questions and stage reading passages, the
-- last two pieces of DB content with no translation storage at all.
--
-- exercise_questions: title/instruction/options/explanation translated,
-- same pattern as placement_questions. correct_index (0-based position in
-- `options`) replaces text-equality matching against correct_answer, since
-- once options are localized the child taps a translated string that can
-- no longer be compared against the English correct_answer text.
-- `correct_answer` is left in place as a human-readable reference column,
-- no longer read by the app once db.js is updated.
--
-- stage_reading_passages: only `translation` gets _ar/_ms - `text_content`
-- is the Arabic passage itself being read, identical in every language.
--
-- Safe to run now - nullable/backfillable columns, touches nothing else.
-- Run once in the Supabase SQL Editor.

alter table public.exercise_questions add column if not exists title_ar text;
alter table public.exercise_questions add column if not exists title_ms text;
alter table public.exercise_questions add column if not exists instruction_ar text;
alter table public.exercise_questions add column if not exists instruction_ms text;
alter table public.exercise_questions add column if not exists options_ar jsonb;
alter table public.exercise_questions add column if not exists options_ms jsonb;
alter table public.exercise_questions add column if not exists explanation_ar text;
alter table public.exercise_questions add column if not exists explanation_ms text;
alter table public.exercise_questions add column if not exists correct_index int;

update public.exercise_questions
set correct_index = (
  select pos - 1
  from jsonb_array_elements_text(options) with ordinality as opt(value, pos)
  where opt.value = correct_answer
  limit 1
)
where correct_index is null;

alter table public.stage_reading_passages add column if not exists translation_ar text;
alter table public.stage_reading_passages add column if not exists translation_ms text;
