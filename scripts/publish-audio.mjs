// Publishes the approved voice clips (audio-library/*.mp3).
//
//   node scripts/publish-audio.mjs           dry run: counts only, changes nothing
//   node scripts/publish-audio.mjs --copy    copy the clips into frontend/public/audio/lesson/
//                                            (local files only; they ship with the next deploy)
//   --include-adhkar                         also publish the morning/evening adhkar clips (AD-*), ONLY after the reviewer approves them
//   --include-arabic-narration               also publish the 277 Arabic narration clips, ONLY after the owner/reviewer approve them
//   node scripts/publish-audio.mjs --apply  mark those clips APPROVED in the live database
//                                            (audio_assets.file_url + status). Run this AT RELEASE,
//                                            right after the deploy, not before.
//
// The owner approved all 859 clips on 2026-10-18. Qur'an verse clips are not in
// the library (the app plays the existing reciter audio for those).

import 'dotenv/config';
import { readdirSync, mkdirSync, copyFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'audio-library');
const dest = path.join(root, 'frontend', 'public', 'audio', 'lesson');
const args = process.argv.slice(2);

// Adhkar clips (AD-*) are draft until the reviewer approves their text: they are only
// published with --include-adhkar, after that sign-off.
const withAdhkar = args.includes('--include-adhkar');
// The Arabic narration clips (audio-colab/arabic.json: Arabic intros, chants, wudu/movement/
// phrase narration) read a Claude-drafted overlay, so they stay unpublished until the owner
// and reviewer approve them: --include-arabic-narration.
const withArabicNarration = args.includes('--include-arabic-narration');
const arabicNarrationFile = path.join(root, 'audio-colab', 'arabic.json');
const arabicNarration = new Set();
if (existsSync(arabicNarrationFile)) {
  const parsed = JSON.parse(readFileSync(arabicNarrationFile, 'utf8'));
  const list = Array.isArray(parsed) ? parsed : parsed.clips ?? Object.entries(parsed).map(([id, v]) => ({ id, ...v }));
  for (const c of list) arabicNarration.add(c.id);
}
const ids = readdirSync(src)
  .filter((f) => f.endsWith('.mp3'))
  .map((f) => f.slice(0, -4))
  .filter((id) => withAdhkar || !id.startsWith('AD-'))
  .filter((id) => withArabicNarration || !arabicNarration.has(id))
  .sort();
const urlFor = (id) => `/audio/lesson/${id}.mp3`;
console.log(`${ids.length} approved clips in audio-library/`);

if (args.includes('--copy')) {
  mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const id of ids) {
    copyFileSync(path.join(src, `${id}.mp3`), path.join(dest, `${id}.mp3`));
    n += 1;
  }
  console.log(`copied ${n} files to frontend/public/audio/lesson/`);
}

if (args.includes('--apply')) {
  if (!existsSync(dest)) {
    console.error('Run with --copy first so the files ship with the deploy.');
    process.exit(1);
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: rows, error } = await supabase.from('audio_assets').select('id');
  if (error) throw error;
  const known = new Set(rows.map((r) => r.id));
  const todo = ids.filter((id) => known.has(id));
  const unknown = ids.filter((id) => !known.has(id));
  console.log(`${todo.length} clips match audio_assets rows (${unknown.length} have no row and are skipped)`);
  const now = new Date().toISOString();
  let done = 0;
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const { error: e } = await supabase
      .from('audio_assets')
      .update({
        status: 'approved',
        reviewed_at: now,
        notes: 'Approved by the owner on 2026-10-18.',
        license_note: 'Generated with Chatterbox Multilingual (MIT licence).',
      })
      .in('id', batch);
    if (e) throw e;
    // file_url differs per row, so set it one by one
    for (const id of batch) {
      const { error: e2 } = await supabase.from('audio_assets').update({ file_url: urlFor(id) }).eq('id', id);
      if (e2) throw e2;
      done += 1;
    }
  }
  console.log(`marked ${done} clips approved with their file URLs`);
} else if (!args.includes('--copy')) {
  console.log('(dry run - nothing changed. Use --copy, then --apply at release.)');
}
