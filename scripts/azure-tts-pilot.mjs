// Offline voice pilot using Azure AI Speech (free F0 tier: 0.5M neural chars/month).
//
// Reads clip texts from the content pack via the importer's own manifest
// builder, so the Arabic is exactly what the pack says. Nothing touches the
// database: audio goes to ./audio-pilot/<f|m>/<audio_id>.mp3 and an
// audio-pilot/index.html listening page is written next to it. Shipping any
// of this still goes through the Audio Review page (clips start `pending`).
//
// Setup: add to the root .env (never commit it)
//   AZURE_SPEECH_KEY=...        Azure portal -> Speech resource -> Keys and Endpoint
//   AZURE_SPEECH_REGION=...     e.g. southeastasia (the "Location/Region" shown there)
//
// Usage:
//   node scripts/azure-tts-pilot.mjs --dry-run         list clips + char count, no key needed
//   node scripts/azure-tts-pilot.mjs                   pilot set, female AND male voices
//   node scripts/azure-tts-pilot.mjs --voice f --all   all clips, one voice (resumable)
//   node scripts/azure-tts-pilot.mjs --html-only       rebuild the listening page only
//   node scripts/azure-tts-pilot.mjs --provider edge   no-account PREVIEW via the Edge read-aloud voices
//                                                      (same voices, unofficial: judge quality only,
//                                                      ship with the official Azure key). Needs
//                                                      `npm i --no-save msedge-tts`; writes audio-pilot-edge/
//
// Flags: --provider azure|edge  --pack <path>  --rate <-10%>  --voice f|m|both  --all  --force

import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContentPack, buildAudioManifest } from './import-content-pack.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const providerArg = process.argv.includes('--provider') ? process.argv[process.argv.indexOf('--provider') + 1] : 'azure';
const outRoot = path.join(root, providerArg === 'edge' ? 'audio-pilot-edge' : 'audio-pilot');

// Voice names verified against Microsoft's published voice list.
const VOICES = {
  ar: { f: 'ar-SA-ZariyahNeural', m: 'ar-SA-HamedNeural', locale: 'ar-SA' },
  en: { f: 'en-US-JennyNeural', m: 'en-US-GuyNeural', locale: 'en-US' },
  ms: { f: 'ms-MY-YasminNeural', m: 'ms-MY-OsmanNeural', locale: 'ms-MY' },
};

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const packPath = opt('pack', path.join(root, '..', 'arabikids-content-pack-draft.md'));
const rate = opt('rate', '-10%'); // slightly slower reads better for small children
const voiceArg = opt('voice', 'both');
const voiceKeys = voiceArg === 'both' ? ['f', 'm'] : [voiceArg];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function selectClips() {
  const items = parseContentPack(readFileSync(packPath, 'utf8'));
  const clips = buildAudioManifest(items).filter((c) => c.language in VOICES && c.script_text);
  if (flag('all')) return clips;

  // Pilot set: Letter Ba (every clip), the first two wudu steps, the wudu
  // intention + du'a (Arabic with tashkeel is the real test), one character intro.
  const pick = new Set(['L02']);
  for (const i of items.filter((x) => x.kind === 'wudu_step').slice(0, 2)) pick.add(i.id);
  for (const i of items) if (i.kind === 'wudu_dua' || i.kind === 'wudu_intention') pick.add(i.id);
  return clips.filter(
    (c) => pick.has(c.content_ref) || c.id === 'intro.A01.wudu.amir.en' || c.id === 'intro.A01.wudu.amir.ms',
  );
}

async function azureFetch(region, key, urlPath, init) {
  const base = `https://${region}.tts.speech.microsoft.com`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const res = await fetch(base + urlPath, { ...init, headers: { 'Ocp-Apim-Subscription-Key': key, ...init.headers } });
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * attempt);
      continue;
    }
    return res;
  }
  throw new Error('Azure kept returning 429/5xx - try again in a minute');
}

async function checkVoices(region, key) {
  const res = await azureFetch(region, key, '/cognitiveservices/voices/list', { method: 'GET', headers: {} });
  if (!res.ok) {
    throw new Error(`Voice list failed (${res.status}). Check AZURE_SPEECH_KEY / AZURE_SPEECH_REGION. ${await res.text()}`);
  }
  const names = new Set((await res.json()).map((v) => v.ShortName));
  const missing = [];
  for (const lang of Object.values(VOICES)) for (const k of voiceKeys) if (!names.has(lang[k])) missing.push(lang[k]);
  if (missing.length) throw new Error(`Voices not available in region "${region}": ${missing.join(', ')}`);
}

const edgeClients = new Map();
async function synthEdge(lang, voiceKey, text) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const name = VOICES[lang][voiceKey];
  if (!edgeClients.has(name)) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(name, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    edgeClients.set(name, tts);
  }
  const { audioStream } = edgeClients.get(name).toStream(text, { rate });
  const chunks = [];
  for await (const c of audioStream) chunks.push(c);
  const buf = Buffer.concat(chunks);
  if (!buf.length) throw new Error('empty audio');
  return buf;
}

async function synth(region, key, lang, voiceKey, text) {
  if (providerArg === 'edge') return synthEdge(lang, voiceKey, text);
  const v = VOICES[lang];
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${v.locale}">`
    + `<voice name="${v[voiceKey]}"><prosody rate="${rate}">${esc(text)}</prosody></voice></speak>`;
  const res = await azureFetch(region, key, '/cognitiveservices/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'arabikids-pilot',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function writeHtml(clips) {
  const row = (c) => {
    const players = ['f', 'm']
      .map((k) => (existsSync(path.join(outRoot, k, `${c.id}.mp3`))
        ? `<td><audio controls preload="none" src="${k}/${esc(c.id)}.mp3"></audio><div class="v">${VOICES[c.language][k]}</div></td>`
        : '<td class="none">-</td>'))
      .join('');
    const dir = c.language === 'ar' ? ' dir="rtl" class="ar"' : '';
    return `<tr><td class="id">${esc(c.id)}<br><span class="lg">${c.language}</span></td><td${dir}>${esc(c.script_text)}</td>${players}</tr>`;
  };
  const html = `<!doctype html><meta charset="utf-8"><title>ArabiKids voice pilot</title>
<style>body{font:15px system-ui;margin:24px;max-width:1000px}table{border-collapse:collapse;width:100%}
td{border-bottom:1px solid #ddd;padding:8px;vertical-align:top}.ar{font-size:30px;line-height:1.6}
.id{font-family:monospace;font-size:12px;width:170px}.lg{background:#1B4F8A;color:#fff;padding:0 6px;border-radius:4px}
.v{font-size:11px;color:#666}.none{color:#aaa}</style>
<h1>ArabiKids voice pilot (${providerArg === 'edge' ? 'Edge preview voices' : 'Azure AI Speech'})</h1>
<p>Female and male voice per language. Judge Arabic tashkeel and Malay naturalness first. Nothing here is approved or live.</p>
<table>${clips.map(row).join('')}</table>`;
  writeFileSync(path.join(outRoot, 'index.html'), html);
}

async function main() {
  const clips = selectClips();
  const chars = clips.reduce((n, c) => n + c.script_text.length, 0);
  const byLang = clips.reduce((m, c) => ((m[c.language] = (m[c.language] ?? 0) + 1), m), {});
  const total = chars * voiceKeys.length;
  console.log(`Clips: ${clips.length} (${JSON.stringify(byLang)}), ${chars} chars x ${voiceKeys.length} voice(s) = ${total} chars of the 500,000/month free tier`);

  if (flag('dry-run')) {
    for (const c of clips) console.log(`  ${c.id} [${c.language}] ${c.script_text}`);
    console.log('(dry run - nothing generated)');
    return;
  }

  mkdirSync(outRoot, { recursive: true });
  if (flag('html-only')) {
    writeHtml(clips);
    console.log('Wrote audio-pilot/index.html');
    return;
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (providerArg !== 'edge' && (!key || !region)) {
    console.error('Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION in .env (see the header of this script).');
    process.exit(1);
  }
  if (providerArg !== 'edge') {
    await checkVoices(region, key);
    console.log(`Region ${region}: all voices available.`);
  }

  let made = 0;
  let skipped = 0;
  for (const k of voiceKeys) {
    mkdirSync(path.join(outRoot, k), { recursive: true });
    for (const c of clips) {
      const file = path.join(outRoot, k, `${c.id}.mp3`);
      if (!flag('force') && existsSync(file)) {
        skipped += 1;
        continue;
      }
      try {
        writeFileSync(file, await synth(region, key, c.language, k, c.script_text));
        made += 1;
        process.stdout.write('.');
      } catch (err) {
        console.error(`\nFAILED ${c.id} (${k}): ${err.message}`);
      }
      await sleep(150);
    }
  }
  writeHtml(clips);
  console.log(`\nDone: ${made} generated, ${skipped} already existed. Open audio-pilot/index.html`);
}

main()
  .then(() => process.exit(0)) // msedge-tts keeps its websocket open
  .catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
