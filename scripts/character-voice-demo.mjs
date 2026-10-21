// Preview of character voices (Hudi / Amir / Nur) for the pilot server.
// Writes audio-pilot-edge/characters/ (+ index.html). Edge preview only.
// Only Azure's English voices include real child voices (girls: Ana, Maisie);
// Malay/Arabic have none, so those are adult voices pitch-shifted upward.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContentPack } from './import-content-pack.mjs';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'audio-pilot-edge', 'characters');
mkdirSync(out, { recursive: true });

const items = parseContentPack(readFileSync(path.join(root, '..', 'arabikids-content-pack-draft.md'), 'utf8'));
const hudi = items.find((i) => i.kind === 'host_line' && i.data.character === 'hudi');
const prac = items.find((i) => i.kind === 'host_line' && i.data.character === 'practical');
const fill = (t, v) => Object.entries(v).reduce((a, [k, x]) => a.replaceAll(`{${k}}`, x), t);
const line = (who, lang) => (who === 'hudi'
  ? fill(lang === 'ms' ? hudi.data.malay : hudi.data.english, { letter: 'Ba', topic: 'Ba' })
  : fill(lang === 'ms' ? prac.data.malay : prac.data.english, { name: who === 'amir' ? 'Amir' : 'Nur', topic: lang === 'ms' ? 'wuduk' : 'wudu' }));

// [id, label, lang, voice, pitch, rate]
const CLIPS = [
  ['hudi.en', 'Hudi - adult guide', 'en', 'en-US-GuyNeural', '+6%', '0%'],
  ['hudi.ms', 'Hudi - adult guide', 'ms', 'ms-MY-OsmanNeural', '+6%', '0%'],
  ['nur.en', 'Nur - REAL child voice (Ana)', 'en', 'en-US-AnaNeural', '0%', '0%'],
  ['nur.ms', 'Nur - adult voice shifted up', 'ms', 'ms-MY-YasminNeural', '+25%', '0%'],
  ['amirA.en', 'Amir option A - Ana pitched down (boyish child)', 'en', 'en-US-AnaNeural', '-12%', '0%'],
  ['amirB.en', 'Amir option B - adult male shifted up', 'en', 'en-US-GuyNeural', '+30%', '+3%'],
  ['amir.ms', 'Amir - adult male shifted up', 'ms', 'ms-MY-OsmanNeural', '+30%', '+3%'],
];

const rows = [];
for (const [id, label, lang, voice, pitch, rate] of CLIPS) {
  const who = id.startsWith('hudi') ? 'hudi' : id.startsWith('amir') ? 'amir' : 'nur';
  const text = line(who, lang);
  let chunks;
  for (let attempt = 1; ; attempt += 1) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      chunks = [];
      for await (const ch of tts.toStream(text, { pitch, rate }).audioStream) chunks.push(ch);
      tts.close();
      break;
    } catch (err) {
      if (attempt >= 5) throw err;
      await new Promise((r) => setTimeout(r, 4000 * attempt)); // back off on 429
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  writeFileSync(path.join(out, `${id}.mp3`), Buffer.concat(chunks));
  rows.push(`<tr><td><b>${label}</b><br>${lang.toUpperCase()}</td><td>${text}</td><td><audio controls preload="none" src="${id}.mp3"></audio><div class="v">${voice} pitch ${pitch} rate ${rate}</div></td></tr>`);
  console.log('ok', id);
}
writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Character voices</title>
<style>body{font:15px system-ui;margin:24px;max-width:900px}td{border-bottom:1px solid #ddd;padding:10px;vertical-align:top}.v{font-size:11px;color:#666}</style>
<h1>Character voice demo v2 (preview)</h1><p>Only Nur (English) is a real child voice. Everything else is an adult voice shifted in pitch. Arabic content is not spoken by the characters.</p>
<table>${rows.join('')}</table>`);
process.exit(0);
