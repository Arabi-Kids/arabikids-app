// Generates the whole voice library (every clip in the content pack's audio
// manifest) into ./audio-library/<audio_id>.mp3, one voice per speaker.
// Local only and gitignored: nothing is uploaded and no clip is approved. The
// dev preview (npm run dev:fixture) plays these via /dev-audio as "pending".
//
// Resumable: existing files are skipped, so it is safe to stop and re-run.
//   node scripts/generate-local-library.mjs                      preview voices (no account)
//   node scripts/generate-local-library.mjs --provider azure     official Azure (needs .env key)
//   node scripts/generate-local-library.mjs --force              regenerate everything
//
// Speakers: Hudi (letter lessons, intros, reactions), Amir / Nur (Practical
// Life intros), narrator (everything else); Arabic is always the reciter voice.
// Qur'anic verse clips are skipped: they need licensed reciter audio.

import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContentPack, buildAudioManifest } from './import-content-pack.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'audio-library');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(`--${n}`) && args[args.indexOf(`--${n}`) + 1]) || d;
const provider = opt('provider', 'edge');
const packPath = opt('pack', path.join(root, '..', 'arabikids-content-pack-draft.md'));

// [voice, pitch, rate]. Only Nur (en) is a real child voice; the rest are adult
// voices shifted. Tweak here and re-run with --force to change a speaker.
const SPEAKERS = {
  reciter: { ar: ['ar-SA-ZariyahNeural', '0%', '-10%'] },
  narrator: { en: ['en-US-JennyNeural', '0%', '0%'], ms: ['ms-MY-YasminNeural', '0%', '0%'] },
  hudi: { en: ['en-US-GuyNeural', '+6%', '0%'], ms: ['ms-MY-OsmanNeural', '+6%', '0%'] },
  nur: { en: ['en-US-AnaNeural', '0%', '0%'], ms: ['ms-MY-YasminNeural', '+25%', '0%'] },
  amir: { en: ['en-US-AnaNeural', '-12%', '0%'], ms: ['ms-MY-OsmanNeural', '+30%', '+3%'] },
};
const LOCALE = { ar: 'ar-SA', en: 'en-US', ms: 'ms-MY' };

const items = parseContentPack(readFileSync(packPath, 'utf8'));
const kindOf = new Map(items.map((i) => [i.id, i.kind]));
const clips = buildAudioManifest(items).filter((c) => c.language in LOCALE && c.script_text && kindOf.get(c.content_ref) !== 'surah_verse');

function speakerFor(c) {
  if (c.language === 'ar') return 'reciter';
  if (c.id.includes('.amir.')) return 'amir';
  if (c.id.includes('.nur.')) return 'nur';
  if (c.id.startsWith('intro.') || c.id.startsWith('L') || kindOf.get(c.content_ref) === 'reaction') return 'hudi';
  return 'narrator';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const edge = new Map();

async function synthEdge(text, [voice, pitch, rate]) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  for (let attempt = 1; ; attempt += 1) {
    try {
      if (!edge.has(voice)) {
        const t = new MsEdgeTTS();
        await t.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
        edge.set(voice, t);
      }
      const chunks = [];
      for await (const ch of edge.get(voice).toStream(text, { pitch, rate }).audioStream) chunks.push(ch);
      const buf = Buffer.concat(chunks);
      if (!buf.length) throw new Error('empty audio');
      return buf;
    } catch (err) {
      edge.delete(voice); // reconnect next time
      if (attempt >= 6) throw err;
      await sleep(4000 * attempt); // back off (the free service rate-limits)
    }
  }
}

async function synthAzure(text, [voice, pitch, rate], lang) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error('Missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION in .env');
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LOCALE[lang]}">`
    + `<voice name="${voice}"><prosody pitch="${pitch}" rate="${rate}">${esc(text)}</prosody></voice></speak>`;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'arabikids-library',
      },
      body: ssml,
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error('Azure kept returning 429/5xx');
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const todo = clips.filter((c) => args.includes('--force') || !existsSync(path.join(outDir, `${c.id}.mp3`)));
  const chars = todo.reduce((n, c) => n + c.script_text.length, 0);
  console.log(`${clips.length} clips in library, ${todo.length} to generate (${chars} chars) via ${provider}`);
  let done = 0;
  let failed = 0;
  for (const c of todo) {
    const cfg = SPEAKERS[speakerFor(c)][c.language];
    try {
      const buf = provider === 'azure' ? await synthAzure(c.script_text, cfg, c.language) : await synthEdge(c.script_text, cfg);
      writeFileSync(path.join(outDir, `${c.id}.mp3`), buf);
      done += 1;
    } catch (err) {
      failed += 1;
      console.error(`FAILED ${c.id}: ${err.message}`);
    }
    if (done % 25 === 0 && done) console.log(`${done}/${todo.length}`);
    await sleep(provider === 'azure' ? 120 : 1200);
  }
  console.log(`Done: ${done} generated, ${failed} failed. Re-run to retry failures.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
