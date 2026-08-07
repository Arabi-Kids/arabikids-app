-- Additive migration for the LIVE project - adds language support.
--
-- users.language: the parent's chosen UI language (English/Arabic/Malay),
-- captured client-side by the first-visit language picker (see
-- frontend/src/context/LanguageContext.jsx) and written on registration,
-- then updatable any time from the Navbar switcher. Once set on the
-- account it wins over the guest's localStorage choice on future logins.
--
-- lessons.content_ar / lessons.content_ms: parallel translated copies of
-- lessons.content (same jsonb key structure). Only the explanatory prose
-- fields are translated - the Arabic script being taught (letters, words,
-- Qur'an passages) is identical in every language, so those keys are
-- reused as-is inside the translated blob. Each translated blob also
-- carries `title`/`lessonGoal`/`arabicWordMeaning` overrides since those
-- live as separate columns on the English row. Nullable/optional per
-- lesson - untranslated lessons fall back to the English `content` column
-- (see frontend/src/lib/db.js's getLessonDetail).
--
-- Safe to run now - three nullable columns, touches nothing else. Run once
-- in the Supabase SQL Editor.

alter table public.users add column if not exists language text
  check (language in ('en', 'ar', 'ms'));

alter table public.lessons add column if not exists content_ar jsonb;
alter table public.lessons add column if not exists content_ms jsonb;
