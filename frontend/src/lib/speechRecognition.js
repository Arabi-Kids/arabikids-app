// Pronunciation-check scoring (spec section 4: "Speech-to-Text"). Uses the
// browser's built-in SpeechRecognition (Chrome/Edge/Safari; no Firefox
// support, no API key, no server round trip) rather than a paid cloud STT
// provider - accuracy is "good enough for an encouraging star rating," not
// scholarly tajweed grading, which fits the spec's own instruction that
// feedback must stay encouraging (stars), never a pass/fail red X.

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function isSpeechRecognitionSupported() {
  return !!SpeechRecognitionImpl;
}

// One-shot listen: resolves with every alternative transcript the engine
// returned (we score all of them and keep the best match, since the correct
// reading is sometimes the 2nd/3rd guess rather than the top one).
export function listenOnce({ lang = 'ar-SA', maxAlternatives = 3 } = {}) {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognitionImpl) {
      reject(new Error('Speech recognition is not supported in this browser.'));
      return;
    }
    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onresult = (event) => {
      const alternatives = [...event.results[0]].map((r) => r.transcript);
      resolve(alternatives);
    };
    recognition.onerror = (event) => reject(new Error(event.error || 'Speech recognition failed.'));
    recognition.onend = () => {};

    recognition.start();
  });
}

// Arabic harakat (short vowel marks), tanween and tatweel don't reliably
// come back from speech recognition, so strip them from both sides before
// comparing - otherwise a perfect reading would score low purely because
// the transcript lacks diacritics the target text has.
const DIACRITICS_RE = /[ً-ْٰـ]/g;

function normalize(text) {
  return text.replace(DIACRITICS_RE, '').replace(/\s+/g, ' ').trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[n];
}

function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// Returns { stars: 1|2|3, similarity } - always at least 1 star. Feedback
// copy stays encouraging at every tier, per spec ("never pass/fail red X").
export function scorePronunciation(targetText, transcripts) {
  const target = normalize(targetText);
  let best = 0;
  for (const t of transcripts) {
    const score = similarity(target, normalize(t));
    if (score > best) best = score;
  }
  const stars = best >= 0.75 ? 3 : best >= 0.4 ? 2 : 1;
  return { stars, similarity: best };
}
