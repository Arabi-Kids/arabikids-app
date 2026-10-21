// Exports the clips to synthesise as a small JSON file to upload into the
// Chatterbox Colab notebook (scripts/colab/chatterbox-tts.ipynb).
//   node scripts/export-colab-clips.mjs            -> audio-colab/clips-pilot.json (18 clips)
//   node scripts/export-colab-clips.mjs --all      -> audio-colab/clips-all.json   (all clips)
// The text comes straight from the content pack manifest; Arabic is not altered.
// audio-colab/ is gitignored (it holds draft content).

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContentPack, buildAudioManifest } from './import-content-pack.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const all = process.argv.includes('--all');
const packPath = path.join(root, '..', 'arabikids-content-pack-draft.md');

const items = parseContentPack(readFileSync(packPath, 'utf8'));
const kindOf = new Map(items.map((i) => [i.id, i.kind]));
let clips = buildAudioManifest(items).filter((c) => c.script_text && kindOf.get(c.content_ref) !== 'surah_verse');

if (!all) {
  // Same pilot set as the Azure/Edge pilot: Letter Ba, wudu steps 1-2, wudu
  // intention and du'as (Arabic tashkeel is the real test), one character intro.
  const pick = new Set(['L02']);
  for (const i of items.filter((x) => x.kind === 'wudu_step').slice(0, 2)) pick.add(i.id);
  for (const i of items) if (i.kind === 'wudu_dua' || i.kind === 'wudu_intention') pick.add(i.id);
  clips = clips.filter((c) => pick.has(c.content_ref) || c.id === 'intro.A01.wudu.amir.en' || c.id === 'intro.A01.wudu.amir.ms');
}

function speakerFor(c) {
  if (c.language === 'ar') return 'reciter';
  if (c.id.includes('.amir.')) return 'amir';
  if (c.id.includes('.nur.')) return 'nur';
  if (c.id.startsWith('intro.') || c.id.startsWith('L') || kindOf.get(c.content_ref) === 'reaction') return 'hudi';
  return 'narrator';
}

const out = clips.map((c) => ({ id: c.id, language: c.language, text: c.script_text, speaker: speakerFor(c) }));
mkdirSync(path.join(root, 'audio-colab'), { recursive: true });
const file = path.join(root, 'audio-colab', all ? 'clips-all.json' : 'clips-pilot.json');
writeFileSync(file, JSON.stringify(out, null, 1), 'utf8');
const chars = out.reduce((n, c) => n + c.text.length, 0);
console.log(`${out.length} clips, ${chars} characters -> ${file}`);
