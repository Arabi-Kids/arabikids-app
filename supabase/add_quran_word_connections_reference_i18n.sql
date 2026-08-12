-- Fix for add_quran_pillar.sql: quran_word_connections.reference was
-- missed when localizing the migrated word citations - the original
-- content_ar/content_ms.quranicConnection.reference text (already
-- professionally translated for all 172 lessons) needs its own columns,
-- same pattern as translation_ar/translation_ms and note_ar/note_ms.
-- Safe to run now, additive. Run once in the Supabase SQL Editor.

alter table public.quran_word_connections add column if not exists reference_ar text;
alter table public.quran_word_connections add column if not exists reference_ms text;
