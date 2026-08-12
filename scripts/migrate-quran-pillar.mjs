// One-time migration: populates the new Qur'an pillar tables
// (quran_surahs/quran_ayahs/quran_units/quran_word_connections) from the
// live `lessons` table's embedded Qur'an fields (content.surahCorner,
// content.surahFluencyCheck, content.quranicConnection, content.quranRef).
// Reads content/content_ar/content_ms to capture localized text too.
// Safe to fix and re-run (upserts on natural unique keys) BEFORE the
// separate strip-quran-fields.mjs script runs. Run manually:
//   node scripts/migrate-quran-pillar.mjs
// Requires supabase/add_quran_pillar.sql to have been run first.
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Small fixed set (4 surahs taught today) - hardcoded rather than scraped
// from lesson data since only 1 of 4 lessons had the Arabic name translated.
const SURAH_ARABIC_NAMES = {
  1: 'الفاتحة',
  112: 'الإخلاص',
  113: 'الفلق',
  114: 'الناس',
};

async function main() {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, stage_id, order_index, arabic_word, arabic_word_meaning, content, content_ar, content_ms, is_free, estimated_minutes')
    .order('stage_id')
    .order('order_index');
  if (error) throw error;

  // --- quran_surahs + quran_ayahs, derived from every surahCorner block ---
  const surahs = new Map(); // surah_number -> {name, total_ayahs}
  const ayahs = new Map(); // "surah:ayah" -> row

  for (const lesson of lessons) {
    const sc = lesson.content?.surahCorner;
    if (!sc) continue;
    surahs.set(sc.surahNumber, { name: sc.surahName, total_ayahs: sc.totalAyahsInSurah });
    for (const a of sc.cumulativeAyahs) {
      const key = `${sc.surahNumber}:${a.ayah}`;
      if (!ayahs.has(key)) {
        ayahs.set(key, {
          surah_number: sc.surahNumber,
          ayah_number: a.ayah,
          arabic: a.arabic,
          transliteration: a.transliteration,
        });
      }
    }
  }

  const surahRows = [...surahs.entries()].map(([surah_number, v]) => ({
    surah_number,
    name: v.name,
    name_arabic: SURAH_ARABIC_NAMES[surah_number] || null,
    total_ayahs: v.total_ayahs,
  }));
  const { error: surahErr } = await supabase.from('quran_surahs').upsert(surahRows, { onConflict: 'surah_number' });
  if (surahErr) throw surahErr;

  const ayahRows = [...ayahs.values()];
  const { error: ayahErr } = await supabase.from('quran_ayahs').upsert(ayahRows, { onConflict: 'surah_number,ayah_number' });
  if (ayahErr) throw ayahErr;

  // --- quran_units: one per surahCorner lesson + one per surahFluencyCheck lesson ---
  const unitRows = [];
  let orderIndex = 1;
  for (const lesson of lessons) {
    const sc = lesson.content?.surahCorner;
    if (sc) {
      unitRows.push({
        order_index: orderIndex++,
        unit_type: 'surah_corner',
        surah_number: sc.surahNumber,
        title: `${sc.surahName} — Ayah ${sc.ayahNumber}`,
        title_ar: `${SURAH_ARABIC_NAMES[sc.surahNumber] || sc.surahName} — آية ${sc.ayahNumber}`,
        title_ms: `${sc.surahName} — Ayat ${sc.ayahNumber}`,
        ayah_number: sc.ayahNumber,
        cumulative_through: sc.cumulativeAyahs.length,
        is_free: lesson.is_free,
        estimated_minutes: lesson.estimated_minutes || 5,
      });
    }
    const sf = lesson.content?.surahFluencyCheck;
    if (sf) {
      const ayahNums = sf.ayahs.map((a) => a.ayah);
      unitRows.push({
        order_index: orderIndex++,
        unit_type: 'fluency_check',
        surah_number: sf.surahNumber,
        title: `${sf.surahName} — Fluency Check`,
        title_ar: `${SURAH_ARABIC_NAMES[sf.surahNumber] || sf.surahName} — اختبار الطلاقة`,
        title_ms: `${sf.surahName} — Semakan Kelancaran`,
        ayah_range_start: Math.min(...ayahNums),
        ayah_range_end: Math.max(...ayahNums),
        is_free: lesson.is_free,
        estimated_minutes: lesson.estimated_minutes || 5,
      });
    }
  }
  const { error: unitErr } = await supabase.from('quran_units').upsert(unitRows, { onConflict: 'order_index' });
  if (unitErr) throw unitErr;

  // --- quran_word_connections: one per lesson's quranicConnection ---
  const wordRows = [];
  let wordOrder = 1;
  for (const lesson of lessons) {
    const qc = lesson.content?.quranicConnection;
    if (!qc) continue;
    const qcAr = lesson.content_ar?.content?.quranicConnection;
    const qcMs = lesson.content_ms?.content?.quranicConnection;
    const ref = lesson.content?.quranRef;
    wordRows.push({
      source_lesson_id: lesson.id,
      arabic_word: lesson.arabic_word,
      word_meaning: lesson.arabic_word_meaning,
      arabic_citation: qc.arabic,
      translation: qc.translation,
      translation_ar: qcAr?.translation || null,
      translation_ms: qcMs?.translation || null,
      reference: qc.reference,
      reference_ar: qcAr?.reference || null,
      reference_ms: qcMs?.reference || null,
      note: qc.note || null,
      note_ar: qcAr?.note || null,
      note_ms: qcMs?.note || null,
      surah_number: ref?.surah || null,
      ayah_number: ref?.ayah || null,
      order_index: wordOrder++,
    });
  }
  // No natural unique key beyond source_lesson_id (nullable) - clear and
  // re-insert wholesale each run instead of upserting, since this table has
  // no meaningful partial-update case (every row always comes from a lesson).
  const { error: delErr } = await supabase.from('quran_word_connections').delete().neq('id', 0);
  if (delErr) throw delErr;
  const { error: wordErr } = await supabase.from('quran_word_connections').insert(wordRows);
  if (wordErr) throw wordErr;

  console.log('Migration summary:');
  console.log('  quran_surahs:', surahRows.length, '(expect 4)');
  console.log('  quran_ayahs:', ayahRows.length, '(expect 22)');
  console.log('  quran_units:', unitRows.length, '(expect 26)');
  console.log('  quran_word_connections:', wordRows.length, '(expect 172)');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
