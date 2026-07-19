// Browser-native text-to-speech (Web Speech API) — free, no API key, no
// server involved. Arabic voice quality/availability varies by device: some
// browsers have no Arabic voice installed and will fall back to whatever
// default voice they have, which can sound off. Good stopgap until
// pre-recorded audio replaces it (see stages.video_url / capstone notes).
export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
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
