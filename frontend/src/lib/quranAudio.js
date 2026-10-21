// Real Quran reciter audio (Mishary Alafasy), for lessons that cite a real,
// specific ayah - separate from speech.js's letter/word pronunciation (voice
// synthesis, native or TTS). Static, CORS-friendly MP3s, no API key, no
// Netlify function needed - confirmed working via a direct fetch test.
import { duckMusic, unduckMusic } from './music.js';

const RECITER = 'Alafasy_128kbps';

export function getReciterAudioUrl(quranRef) {
  if (!quranRef?.surah || !quranRef?.ayah) return null;
  const surah = String(quranRef.surah).padStart(3, '0');
  const ayah = String(quranRef.ayah).padStart(3, '0');
  return `https://everyayah.com/data/${RECITER}/${surah}${ayah}.mp3`;
}

// The interactive stages name surahs by their English transliteration; the
// existing reciter audio is addressed by surah/ayah number.
export const SURAH_NUMBERS = {
  'Al-Fatihah': 1,
  'Al-Kawthar': 108,
  'Al-Ikhlas': 112,
  'An-Nas': 114,
};

/** { surah, ayah } for a surah_verse content item, or null if unknown. */
export function verseRefFor(item) {
  const surah = SURAH_NUMBERS[item?.data?.surah];
  const ayah = Number(item?.data?.['#']);
  return surah && ayah ? { surah, ayah, surahName: item.data.surah } : null;
}

let currentReciterAudio = null;

/** Plays the real reciter recording for this ayah, if `quranRef` is present.
 * Returns false (and plays nothing) when there's no real citation to play -
 * callers should only render a reciter button when this would return true. */
export function playReciterAudio(quranRef, { onStart, onEnd, onError } = {}) {
  const url = getReciterAudioUrl(quranRef);
  if (!url) return false;

  if (currentReciterAudio) {
    currentReciterAudio.pause();
    currentReciterAudio = null;
  }

  const audio = new Audio(url);
  currentReciterAudio = audio;
  audio.addEventListener('playing', () => duckMusic(0), { once: true });
  for (const ev of ['ended', 'error', 'pause']) audio.addEventListener(ev, unduckMusic, { once: true });
  audio.addEventListener('playing', () => onStart?.(), { once: true });
  audio.addEventListener('ended', () => onEnd?.(), { once: true });
  audio.addEventListener('error', () => onError?.(), { once: true });
  audio.play().catch(() => onError?.());
  return true;
}

/** Chains every ayah's real reciter audio back-to-back via onEnd, so a
 * single call plays a whole surah straight through - reuses the same
 * per-ayah URLs as playReciterAudio, no new audio needed. Callback-based
 * (no internal React state) so callers manage their own "is playing" UI
 * state, same convention as playReciterAudio itself. */
export function playFluencySurah({ surahNumber, surahName, ayahs }, { onEnd, onError } = {}) {
  let i = 0;
  const playNext = () => {
    if (i >= ayahs.length) {
      onEnd?.();
      return;
    }
    const ayah = ayahs[i];
    i += 1;
    playReciterAudio({ surah: surahNumber, ayah: ayah.ayah, surahName }, { onEnd: playNext, onError: () => onError?.() });
  };
  playNext();
}

/** "2:255" or "1:1; 112:1-4; 1:1; 113:1-5" -> [{ surah, ayah }, ...] in order. Numbers only. */
export function parseQuranRefs(text) {
  const refs = [];
  for (const part of String(text || '').split(';')) {
    const m = /^\s*(\d+):(\d+)(?:-(\d+))?\s*$/.exec(part);
    if (!m) continue;
    const surah = Number(m[1]);
    const from = Number(m[2]);
    const to = Number(m[3] || m[2]);
    for (let a = from; a <= to; a += 1) refs.push({ surah, ayah: a });
  }
  return refs;
}

/** Plays a list of ayat back to back with the reciter audio. */
export function playRefChain(refs, { onEnd, onError } = {}) {
  let i = 0;
  const next = () => {
    if (i >= refs.length) {
      onEnd?.();
      return;
    }
    const ref = refs[i];
    i += 1;
    playReciterAudio(ref, { onEnd: next, onError: () => onError?.() });
  };
  next();
  return refs.length > 0;
}
