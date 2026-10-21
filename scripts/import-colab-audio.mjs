// Brings the zip from the Chatterbox Colab notebook back onto this computer.
//   node scripts/import-colab-audio.mjs <chatterbox-out.zip>            pilot: audio-pilot-edge/chatterbox/ + listening page
//   node scripts/import-colab-audio.mjs <chatterbox-out.zip> --library  full set: audio-library/ (the dev preview plays it)
//   node scripts/import-colab-audio.mjs <part2.zip> --library --add      add another part to the existing audio-library/
// Pilot page: http://localhost:5301/chatterbox/ (npm-less: run the "voice-pilot" server).
// --library first moves any existing audio-library to audio-library-previous/ so
// nothing is lost. Nothing is uploaded, approved or committed.

import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const zip = process.argv.slice(2).find((a) => !a.startsWith('--'));
const library = process.argv.includes('--library');
const add = process.argv.includes('--add'); // with --library: keep the existing library and add these clips to it
if (!zip || !existsSync(zip)) {
  console.error('Usage: node scripts/import-colab-audio.mjs <chatterbox-out.zip> [--library]');
  process.exit(1);
}

const tmp = path.join(root, 'audio-colab', '_unzipped');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
// Windows 10+ ships bsdtar, which reads .zip; Git Bash's GNU tar (first on PATH there) cannot.
const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(tar, ['-xf', path.resolve(zip), '-C', tmp]);
const mp3s = readdirSync(tmp).filter((f) => f.endsWith('.mp3'));
if (!mp3s.length) {
  console.error('No .mp3 files found in the zip.');
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (library) {
  const lib = path.join(root, 'audio-library');
  if (existsSync(lib) && !add) {
    const prev = path.join(root, 'audio-library-previous');
    rmSync(prev, { recursive: true, force: true });
    renameSync(lib, prev);
    console.log('Existing library kept at audio-library-previous/');
  }
  mkdirSync(lib, { recursive: true });
  for (const f of mp3s) copyFileSync(path.join(tmp, f), path.join(lib, f));
  console.log(`${mp3s.length} clips copied to audio-library/. Reload http://localhost:5199/dev to hear them.`);
} else {
  const dest = path.join(root, 'audio-pilot-edge', 'chatterbox');
  mkdirSync(dest, { recursive: true });
  for (const f of mp3s) copyFileSync(path.join(tmp, f), path.join(dest, f));
  const clips = JSON.parse(readFileSync(path.join(root, 'audio-colab', 'clips-pilot.json'), 'utf8'));
  const rows = clips
    .filter((c) => existsSync(path.join(dest, `${c.id}.mp3`)))
    .map((c) => {
      const dir = c.language === 'ar' ? ' dir="rtl" class="ar"' : '';
      const edge = existsSync(path.join(root, 'audio-pilot-edge', 'f', `${c.id}.mp3`))
        ? `<audio controls preload="none" src="../f/${esc(c.id)}.mp3"></audio><div class="v">preview voice</div>` : '-';
      return `<tr><td class="id">${esc(c.id)}<br><span class="lg">${c.language}</span></td><td${dir}>${esc(c.text)}</td>`
        + `<td><audio controls preload="none" src="${esc(c.id)}.mp3"></audio><div class="v">Chatterbox</div></td><td>${edge}</td></tr>`;
    });
  writeFileSync(path.join(dest, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Chatterbox pilot</title>
<style>body{font:15px system-ui;margin:24px;max-width:1000px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:8px;vertical-align:top}
.ar{font-size:30px;line-height:1.6}.id{font-family:monospace;font-size:12px;width:170px}.lg{background:#1B4F8A;color:#fff;padding:0 6px;border-radius:4px}.v{font-size:11px;color:#666}</style>
<h1>Chatterbox Multilingual pilot</h1><p>Chatterbox (open source, free) next to the earlier preview voice. Judge Arabic vowel marks and Malay first. Nothing here is approved or live.</p>
<table><tr><th>Clip</th><th>Text</th><th>Chatterbox</th><th>Preview voice (female)</th></tr>${rows.join('')}</table>`);
  console.log(`${mp3s.length} clips copied. Open http://localhost:5301/chatterbox/`);
}
rmSync(tmp, { recursive: true, force: true });
