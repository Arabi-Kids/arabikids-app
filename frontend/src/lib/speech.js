// Two-tier Arabic audio, prioritised by whichever actually sounds more
// authentically Arabic: the device's own native Arabic voice (Web Speech
// API) when one is installed - free, on-device, and a real Arabic speaker's
// voice - falling back to the pre-generated ElevenLabs recording (see
// scripts/generate-audio.mjs) only on a device/browser with no Arabic voice
// at all. The ElevenLabs audio currently uses a stock English voice actor
// speaking Arabic phonetics through a multilingual model, which reads as
// English-accented rather than native - a real installed Arabic voice
// (e.g. Windows' "Microsoft Naayf") beats that whenever one is available.
// Revisit this priority once a proper native-Arabic ElevenLabs voice is
// configured (see ELEVENLABS_VOICE_ID in .env.example).
//
// The filename each piece of text maps to is a deterministic hash computed
// identically here and in the generation script, so the frontend never
// needs a manifest file - it just guesses the URL and handles a 404 by
// falling back.

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Chrome (and some other browsers) populate getVoices() asynchronously and
// return an empty list on the very first call in a session - priming it
// once at module load (rather than only on first playback) means the list
// is essentially always ready by the time a user actually taps a button.
if (isSpeechSupported()) {
  window.speechSynthesis.getVoices();
}

/** Returns the best installed Arabic voice, or null if this device/browser
 * has none. */
function getArabicVoice() {
  if (!isSpeechSupported()) return null;
  const arabicVoices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ar'));
  if (arabicVoices.length === 0) return null;
  return arabicVoices.find((v) => v.localService) || arabicVoices[0];
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
  const voice = getArabicVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'ar-SA';
  utterance.rate = rate;
  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

function playPreGeneratedAudio(text, { rate, onStart, onEnd }) {
  const audio = new Audio(getPreGeneratedAudioUrl(text));
  audio.playbackRate = rate;
  currentAudio = audio;
  audio.addEventListener('playing', () => onStart?.(), { once: true });
  audio.addEventListener('ended', () => onEnd?.(), { once: true });
  // Both a load error and a play() rejection mean "no usable pre-generated
  // file" - either way, this is already the last resort, so just fire onEnd
  // rather than looping back into speakArabic (which just failed/doesn't
  // exist on this device, or we wouldn't be here).
  audio.addEventListener('error', () => onEnd?.(), { once: true });
  audio.play().catch(() => onEnd?.());
}

let currentAudio = null;

/** Prefers the device's own native Arabic voice (free, on-device, actually
 * spoken by an Arabic voice) when one is installed; falls back to the
 * pre-generated ElevenLabs recording only on a device/browser with no
 * Arabic voice at all. `rate` applies either way. */
export function speakSmart(text, { rate = 0.8, onStart, onEnd } = {}) {
  if (!text) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  if (getArabicVoice()) {
    speakArabic(text, { rate, onStart, onEnd });
  } else {
    playPreGeneratedAudio(text, { rate, onStart, onEnd });
  }
}
