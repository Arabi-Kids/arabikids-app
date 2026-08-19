// Lightweight UI sound effects, synthesized on the fly via the Web Audio
// API - no audio files to source, license, or host. Every play function is
// safe to call from anywhere (no-ops if the browser has no AudioContext, if
// the user has muted sound, or if the context is suspended and can't resume
// synchronously - a dropped sound effect should never throw or block the UI
// action it's attached to).
const MUTE_KEY = 'ak_sound_muted';

let ctx = null;
function getContext() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function isMuted() {
  return typeof window !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
}

export function setMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}

// One short, soft sine-wave note. `freq` in Hz, `duration` in seconds.
function tone(freq, { duration = 0.12, delay = 0, volume = 0.12, type = 'sine' } = {}) {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = audioCtx.currentTime + delay;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Soft click for a generic tap (letter tile, card, harakat button). */
export function playTap() {
  if (isMuted()) return;
  tone(500, { duration: 0.06, volume: 0.08 });
}

/** Short two-note "nice!" chime - pronunciation check scored, mini-game win. */
export function playSuccess() {
  if (isMuted()) return;
  tone(660, { duration: 0.1 });
  tone(880, { duration: 0.16, delay: 0.09 });
}

/** Fuller ascending arpeggio - lesson complete, new badge, stage mastery. */
export function playCelebration() {
  if (isMuted()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(freq, { duration: 0.18, delay: i * 0.09, volume: 0.14 });
  });
}

/** Quick rising "whoosh" - stepping forward/back between lesson screens. */
export function playWhoosh() {
  if (isMuted()) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  const start = audioCtx.currentTime;
  osc.frequency.setValueAtTime(320, start);
  osc.frequency.exponentialRampToValueAtTime(560, start + 0.14);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + 0.18);
}
