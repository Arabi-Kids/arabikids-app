// Real Quran reciter audio (Mishary Alafasy), for lessons that cite a real,
// specific ayah - separate from speech.js's letter/word pronunciation (voice
// synthesis, native or TTS). Static, CORS-friendly MP3s, no API key, no
// Netlify function needed - confirmed working via a direct fetch test.
const RECITER = 'Alafasy_128kbps';

export function getReciterAudioUrl(quranRef) {
  if (!quranRef?.surah || !quranRef?.ayah) return null;
  const surah = String(quranRef.surah).padStart(3, '0');
  const ayah = String(quranRef.ayah).padStart(3, '0');
  return `https://everyayah.com/data/${RECITER}/${surah}${ayah}.mp3`;
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
  audio.addEventListener('playing', () => onStart?.(), { once: true });
  audio.addEventListener('ended', () => onEnd?.(), { once: true });
  audio.addEventListener('error', () => onError?.(), { once: true });
  audio.play().catch(() => onError?.());
  return true;
}
