// One-off recovery: quran_word_connections got wiped by re-running
// migrate-quran-pillar.mjs AFTER strip-quran-fields.mjs had already
// removed the source data from the live lessons table (wrong order).
// Rebuilds it from the pre-strip backup JSON written by
// strip-quran-fields.mjs instead of the (now-empty) live lessons columns.
// Run manually: node scripts/restore-quran-word-connections.mjs <backup-file>
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const backupFile = process.argv[2];
if (!backupFile) throw new Error('Usage: node scripts/restore-quran-word-connections.mjs <backup-file>');

const lessons = JSON.parse(readFileSync(backupFile, 'utf8'));

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
    arabic_word: lesson.content?.quranicConnection ? undefined : undefined, // placeholder, overwritten below
    word_meaning: undefined,
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

// arabic_word/word_meaning weren't in the backup's content column (they're
// separate lesson columns not captured in this particular backup shape) -
// re-fetch those two fields from the live lessons table by id, since that
// data was never touched by the strip script.
const { data: liveLessons, error: liveErr } = await supabase.from('lessons').select('id, arabic_word, arabic_word_meaning');
if (liveErr) throw liveErr;
const byId = new Map(liveLessons.map((l) => [l.id, l]));
for (const row of wordRows) {
  const live = byId.get(row.source_lesson_id);
  row.arabic_word = live?.arabic_word ?? row.arabic_citation;
  row.word_meaning = live?.arabic_word_meaning ?? row.translation;
}

const { error: delErr } = await supabase.from('quran_word_connections').delete().neq('id', 0);
if (delErr) throw delErr;
const { error: insErr } = await supabase.from('quran_word_connections').insert(wordRows);
if (insErr) throw insErr;

console.log('Restored quran_word_connections:', wordRows.length, '(expect 172)');
