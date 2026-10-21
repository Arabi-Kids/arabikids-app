// Background music for lessons and stages, synthesised live with the Web Audio
// API (like sounds.js): an original music-box tune, soft pad and bass, so there
// are no audio files to source, license or host.
//
// Rules this module keeps:
//  - Starts only after a user tap (browser rule): useBackgroundMusic wires the
//    first tap on the page to start().
//  - Stays quiet: music is a bed under the narration, never the main sound.
//  - Ducks under narration, and goes fully silent while Arabic is spoken or a
//    Qur'an verse / du'a is recited (duck(0)), so recitation is never mixed
//    with music.
//  - Muted if the child's sound is off (sounds.js) or the music toggle is off.
//  - No music in the Qur'an pillar (those pages simply don't start it).

import { isMuted as soundsMuted } from './sounds.js';

const MUSIC_MUTE_KEY = 'ak_music_muted';
const MASTER_VOLUME = 0.13;

export function isMusicMuted() {
  try {
    return localStorage.getItem(MUSIC_MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMusicMuted(muted) {
  try {
    localStorage.setItem(MUSIC_MUTE_KEY, muted ? '1' : '0');
  } catch {
    // storage blocked: the toggle still works for this session via the check below
  }
  sessionMuted = muted;
  applyLevel();
}

let sessionMuted = null;
const muted = () => (sessionMuted ?? isMusicMuted()) || soundsMuted();

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = (name) => {
  const m = /^([A-G])(\d)$/.exec(name);
  if (!m) return null;
  return 440 * 2 ** ((SEMI[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
};

// Songs: 8 bars of 8 eighth-note steps. Melody tokens are notes or '.' (rest;
// the previous note keeps ringing). All melody notes are C-major pentatonic.
const SONGS = {
  // cheerful, for letter and Arabic lessons
  play: {
    bpm: 100,
    tick: true,
    padVol: 0.5,
    bars: [
      { chord: ['C3', 'E3', 'G3'], bass: 'C3', mel: 'E5 . G5 . E5 . D5 .' },
      { chord: ['A2', 'C3', 'E3'], bass: 'A2', mel: 'C5 . D5 E5 . . D5 .' },
      { chord: ['F2', 'A2', 'C3'], bass: 'F2', mel: 'A4 . C5 . A4 . G4 .' },
      { chord: ['G2', 'B2', 'D3'], bass: 'G2', mel: 'D5 . E5 . D5 . . .' },
      { chord: ['C3', 'E3', 'G3'], bass: 'C3', mel: 'E5 G5 A5 . G5 E5 D5 .' },
      { chord: ['A2', 'C3', 'E3'], bass: 'A2', mel: 'C5 . E5 . D5 C5 A4 .' },
      { chord: ['F2', 'A2', 'C3'], bass: 'F2', mel: 'C5 . A4 G4 A4 . C5 .' },
      { chord: ['G2', 'B2', 'D3'], bass: 'G2', mel: 'D5 E5 D5 . C5 . . .' },
    ],
  },
  // slow and warm, for Practical Life (wudu, prayer, du'as)
  calm: {
    bpm: 62,
    tick: false,
    padVol: 0.9,
    bars: [
      { chord: ['C3', 'E3', 'G3'], bass: 'C3', mel: 'E5 . . . G5 . . .' },
      { chord: ['F2', 'A2', 'C3'], bass: 'F2', mel: 'A4 . . . C5 . . .' },
      { chord: ['C3', 'E3', 'G3'], bass: 'C3', mel: 'D5 . . . E5 . . .' },
      { chord: ['G2', 'B2', 'D3'], bass: 'G2', mel: 'D5 . . . . . . .' },
      { chord: ['C3', 'E3', 'G3'], bass: 'C3', mel: 'G5 . . . E5 . . .' },
      { chord: ['A2', 'C3', 'E3'], bass: 'A2', mel: 'C5 . . . D5 . E5 .' },
      { chord: ['F2', 'A2', 'C3'], bass: 'F2', mel: 'A4 . . . G4 . . .' },
      { chord: ['G2', 'B2', 'D3'], bass: 'G2', mel: 'D5 . . . . . . .' },
    ],
  },
};

let ctx = null;
let bus = null;
let duckGain = null;
let timer = null;
let song = null;
let moodName = null;
let step = 0;
let nextTime = 0;
let duckLevel = 1;
let active = false; // user wants music on this page

function build() {
  const Ctor = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return false;
  ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  duckGain = ctx.createGain();
  duckGain.gain.value = 0;
  duckGain.connect(master);
  master.connect(ctx.destination);
  bus = ctx.createGain();
  bus.connect(duckGain);
  // a soft echo gives the music-box notes some space
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2200;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  bus.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(tone);
  tone.connect(wet);
  wet.connect(duckGain);
  return true;
}

function voice(freq, t, dur, { type = 'sine', vol = 0.3, attack = 0.005, partial = 0 } = {}) {
  if (!freq) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.05);
  if (partial) {
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(vol * partial, t + attack);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
    o2.connect(g2);
    g2.connect(bus);
    o2.start(t);
    o2.stop(t + dur);
  }
}

function playStep(s, t, stepDur) {
  const bar = song.bars[Math.floor(s / 8) % song.bars.length];
  const inBar = s % 8;
  if (inBar === 0) {
    // sustained pad for the whole bar
    bar.chord.forEach((n) => voice(hz(n), t, stepDur * 8.5, { type: 'triangle', vol: 0.09 * song.padVol, attack: 0.5 }));
  }
  if (inBar === 0 || inBar === 4) voice(hz(bar.bass), t, stepDur * 3.6, { type: 'sine', vol: 0.2, attack: 0.02 });
  const tok = bar.mel.split(' ')[inBar];
  if (tok && tok !== '.') voice(hz(tok), t, stepDur * 4.5, { type: 'sine', vol: 0.34, partial: 0.22 });
  if (song.tick && (inBar === 2 || inBar === 6)) voice(1700, t, 0.04, { type: 'sine', vol: 0.05, attack: 0.002 });
}

function tick() {
  if (!ctx || !song) return;
  applyLevel();
  const stepDur = 60 / song.bpm / 2;
  while (nextTime < ctx.currentTime + 0.3) {
    if (!muted() && duckLevel > 0) playStep(step, nextTime, stepDur);
    nextTime += stepDur;
    step = (step + 1) % (song.bars.length * 8);
  }
}

function applyLevel() {
  if (!ctx || !duckGain) return;
  const target = active && !muted() ? duckLevel : 0;
  duckGain.gain.setTargetAtTime(target, ctx.currentTime, target === 0 ? 0.12 : 0.4);
}

/** Start (or switch) the music. Must be called from a user gesture the first time. */
export function startMusic(mood = 'play') {
  if (!ctx && !build()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  active = true;
  if (mood !== moodName || !timer) {
    moodName = mood;
    song = SONGS[mood] ?? SONGS.play;
    step = 0;
    nextTime = ctx.currentTime + 0.1;
  }
  if (!timer) timer = setInterval(tick, 120);
  applyLevel();
}

/** Fade out and stop (page left). */
export function stopMusic() {
  active = false;
  applyLevel();
  clearInterval(timer);
  timer = null;
  moodName = null;
}

/** Lower the music under narration (e.g. 0.28), or 0 for full silence during
 * Arabic / recitation. Release with unduckMusic(). */
export function duckMusic(level = 0.28) {
  duckLevel = level;
  applyLevel();
}

export function unduckMusic() {
  duckLevel = 1;
  applyLevel();
}
