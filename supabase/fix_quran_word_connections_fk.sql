-- Fix for add_quran_pillar.sql, run immediately after it (or before the
-- populate script runs, if that already failed): quran_word_connections.
-- surah_number is a citation reference that can point to ANY of the ~43
-- surahs referenced across the 172 lessons' quranRef fields, not just the
-- 4 surahs that have dedicated quran_units (Al-Fatihah/Al-Ikhlas/Al-Falaq/
-- An-Nas). The original FK to quran_surahs was too strict - drop it. The
-- column stays (still useful for building a reciter-audio URL), just
-- without a referential-integrity requirement against the smaller
-- "surahs we teach as units" table.
alter table public.quran_word_connections drop constraint quran_word_connections_surah_number_fkey;
