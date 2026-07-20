// Two-tier Arabic audio: a pre-generated real recording (Google Cloud TTS,
// see scripts/generate-audio.mjs) if one exists for this exact text, falling
// back to the browser's built-in Web Speech API if not - so lessons whose
// audio hasn't been generated yet (or a device/browser that can't load the
// file) still get *something* audible instead of silence.
//
// The filename each piece of text maps to is a deterministic hash computed
// identically here and in the generation script, so the frontend never
// needs a manifest file - it just guesses the URL and handles a 404 by
// falling back.

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// FNV-1a 32-bit — small, fast, deterministic, no crypto API needed (must
// match scripts/generate-audio.mjs's copy of this exact function).
export function textHash(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function getPreGeneratedAudioUrl(text) {
  if (!text) return null;
  return `/audio/${textHash(text)}.mp3`;
}

export function speakArabic(text, { rate = 0.8, onStart, onEnd } = {}) {
  if (!isSpeechSupported() || !text) return;
  window.speechSynthesis.cancel(); // stop anything already playing first
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = rate;
  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

let currentAudio = null;

/** Plays the real pre-generated recording for this text if one exists;
 * otherwise falls back to speakArabic(). `rate` applies either way (maps
 * directly to HTMLMediaElement.playbackRate for real audio, same 1.0=normal
 * scale as SpeechSynthesisUtterance.rate). */
export function speakSmart(text, { rate = 0.8, onStart, onEnd } = {}) {
  if (!text) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(getPreGeneratedAudioUrl(text));
  audio.playbackRate = rate;
  currentAudio = audio;
  let fellBack = false;

  audio.addEventListener('playing', () => onStart?.(), { once: true });
  audio.addEventListener('ended', () => onEnd?.(), { once: true });
  audio.addEventListener(
    'error',
    () => {
      if (fellBack) return;
      fellBack = true;
      speakArabic(text, { rate, onStart, onEnd });
    },
    { once: true }
  );

  audio.play().catch(() => {
    if (fellBack) return;
    fellBack = true;
    speakArabic(text, { rate, onStart, onEnd });
  });
}
