// Generates real Arabic audio recordings via Google Cloud Text-to-Speech
// for every distinct word/phrase used across the 150 lessons, saving each
// as frontend/public/audio/<hash>.mp3. The frontend (frontend/src/lib/
// speech.js) computes the same hash from the same text at playback time, so
// there's no manifest to keep in sync - it just requests the URL and falls
// back to the browser's Web Speech API on a 404.
//
// Idempotent/resumable: already-generated files are skipped, so re-running
// after adding new lesson content only fills in the gaps.
//
// Requires GOOGLE_CLOUD_TTS_API_KEY in the root .env (Google Cloud Console
// -> APIs & Services -> Credentials -> Create API key, with the
// "Cloud Text-to-Speech API" enabled on that project).
//
// Usage: node scripts/generate-audio.mjs

import 'dotenv/config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STAGES, STAGE_ITEMS, buildLessons } from '../supabase/seed.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'frontend', 'public', 'audio');
mkdirSync(outDir, { recursive: true });

const API_KEY = process.env.GOOGLE_CLOUD_TTS_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_CLOUD_TTS_API_KEY in the environment (.env).');
  console.error('Get one at https://console.cloud.google.com/apis/credentials (enable "Cloud Text-to-Speech API" first).');
  process.exit(1);
}
const VOICE_NAME = process.env.GOOGLE_TTS_VOICE || 'ar-XA-Wavenet-B';

// Must match frontend/src/lib/speech.js's textHash() exactly.
function textHash(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function collectTexts() {
  const texts = new Set();
  for (const stage of STAGES) {
    const items = STAGE_ITEMS[stage.key];
    const lessons = buildLessons(stage.key, items);
    for (const lesson of lessons) {
      if (lesson.arabic_word) texts.add(lesson.arabic_word);
      const c = lesson.content;
      if (c.secondWord?.arabic) texts.add(c.secondWord.arabic);
      if (c.maddPair?.short?.arabic) texts.add(c.maddPair.short.arabic);
      if (c.maddPair?.long?.arabic) texts.add(c.maddPair.long.arabic);
    }
  }
  return [...texts];
}

async function synthesize(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'ar-XA', name: VOICE_NAME },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const { audioContent } = await res.json();
  return Buffer.from(audioContent, 'base64');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const texts = collectTexts();
  console.log(`Found ${texts.length} distinct Arabic strings across all lessons.`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const text of texts) {
    const hash = textHash(text);
    const dest = path.join(outDir, `${hash}.mp3`);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }
    try {
      const audio = await synthesize(text);
      writeFileSync(dest, audio);
      generated++;
      console.log(`Generated ${hash}.mp3 for "${text}"`);
    } catch (err) {
      failed++;
      console.error(`Failed for "${text}": ${err.message}`);
    }
    await sleep(150);
  }

  console.log(`Done. Generated ${generated}, skipped ${skipped} (already existed), failed ${failed}.`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
