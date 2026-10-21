// Approved-audio player for the interactive upgrade (spec section 2).
//
// Rules this module enforces:
//  - Clips are addressed by audio_id; the manifest decides what exists.
//  - Only `approved` clips reach children (RLS hands non-admins nothing else).
//    An admin preview may also get `pending` clips, reported as such so the
//    UI can badge them.
//  - Nothing plays before a user tap: unlockAudio() must have been called
//    from a gesture handler (the lesson's "Start" button) first.
//  - A missing clip is not an error - callers show "audio coming soon".

import { getAudioManifest } from './content.js';
import { duckMusic, unduckMusic } from './music.js';

let manifest = null;
let manifestPromise = null;
let unlocked = false;
let current = null;

export function loadManifest(force = false) {
  if (force) {
    manifest = null;
    manifestPromise = null;
  }
  if (!manifestPromise) {
    manifestPromise = getAudioManifest()
      .then((m) => {
        manifest = m;
        return m;
      })
      .catch(() => {
        manifest = new Map();
        return manifest;
      });
  }
  return manifestPromise;
}

export function getClip(audioId) {
  return manifest?.get(audioId) ?? null;
}

export function isUnlocked() {
  return unlocked;
}

/** Call from a tap handler. Resumes/creates the audio context so later
 * programmatic plays (chant sequences, next clip) are allowed by browsers. */
export function unlockAudio() {
  unlocked = true;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) {
      const ctx = new Ctor();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume?.().catch(() => {});
    }
  } catch {
    // Best effort - HTMLAudioElement playback after a tap works regardless.
  }
}

export function stopClip() {
  if (current) {
    current.pause();
    current = null;
  }
}

/** Plays an approved (or admin-preview) clip. Returns
 * 'played' | 'preview' | 'missing' | 'locked'. */
export function playClip(audioId, { onStart, onEnd, rate = 1 } = {}) {
  if (!unlocked) return 'locked';
  const clip = getClip(audioId);
  if (!clip) return 'missing';

  stopClip();
  const audio = new Audio(clip.fileUrl);
  audio.playbackRate = rate;
  current = audio;
  // Background music: quieter under narration, silent while Arabic is spoken.
  audio.addEventListener('playing', () => duckMusic(/.ar$/.test(audioId) ? 0 : 0.28), { once: true });
  for (const ev of ['ended', 'error', 'pause']) audio.addEventListener(ev, unduckMusic, { once: true });
  audio.addEventListener('playing', () => onStart?.(), { once: true });
  audio.addEventListener('ended', () => onEnd?.(), { once: true });
  audio.addEventListener('error', () => onEnd?.(), { once: true });
  audio.play().catch(() => onEnd?.());
  return clip.status === 'approved' ? 'played' : 'preview';
}
