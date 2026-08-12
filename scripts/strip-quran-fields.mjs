// One-time cleanup: removes the now-migrated Qur'an-specific fields
// (quranicConnection, quranRef, surahCorner, surahFluencyCheck) from every
// lesson's content/content_ar/content_ms jsonb, now that they live in the
// dedicated quran_* tables (see scripts/migrate-quran-pillar.mjs, which
// must have already run and been verified live at /lessons/quran before
// this runs). Backs up the pre-strip content to a local JSON file first.
// Run manually: node scripts/strip-quran-fields.mjs
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const QURAN_KEYS = ['quranicConnection', 'quranRef', 'surahCorner', 'surahFluencyCheck'];

function stripKeys(contentObj) {
  if (!contentObj) return contentObj;
  const next = { ...contentObj };
  for (const key of QURAN_KEYS) delete next[key];
  return next;
}

async function main() {
  const { data: lessons, error } = await supabase.from('lessons').select('id, content, content_ar, content_ms');
  if (error) throw error;

  writeFileSync(
    `scratch_quran_strip_backup_${Date.now()}.json`,
    JSON.stringify(lessons, null, 2)
  );

  let updated = 0;
  for (const lesson of lessons) {
    const newContent = stripKeys(lesson.content);
    const newContentAr = lesson.content_ar ? { ...lesson.content_ar, content: stripKeys(lesson.content_ar.content) } : lesson.content_ar;
    const newContentMs = lesson.content_ms ? { ...lesson.content_ms, content: stripKeys(lesson.content_ms.content) } : lesson.content_ms;

    const { error: updateError } = await supabase
      .from('lessons')
      .update({ content: newContent, content_ar: newContentAr, content_ms: newContentMs })
      .eq('id', lesson.id);
    if (updateError) throw updateError;
    updated++;
  }

  console.log(`Stripped Qur'an fields from ${updated} lessons. Backup written to scratch_quran_strip_backup_*.json.`);
}

main().catch((err) => {
  console.error('Strip failed:', err.message);
  process.exit(1);
});
