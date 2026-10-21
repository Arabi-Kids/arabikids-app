import { useMemo, useRef, useState } from 'react';
import CharacterAvatar from './CharacterAvatar.jsx';
import SpeechBubble, { useWordHighlight } from './SpeechBubble.jsx';
import useAudio from '../../hooks/useAudio.js';
import { getClip } from '../../lib/audioManager.js';
import { playTap } from '../../lib/sounds.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { CHARACTERS, characterName } from '../../lib/characters.config.js';

// Lines rotate per character so the intro never repeats word-for-word twice
// in a row. The counter is per-device; it only has to feel varied.
function nextRotation(characterId, count) {
  const key = `ak_intro_rot_${characterId}`;
  let n = 0;
  try {
    n = Number(localStorage.getItem(key) || 0);
    localStorage.setItem(key, String(n + 1));
  } catch {
    // private mode - fall back to the first line
  }
  return n % Math.max(1, count);
}

function fill(template, vars) {
  return Object.entries(vars || {}).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), template);
}

/** Lesson/stage opener (5-8s): character slides in, waves, speech bubble.
 *  Skippable by tap. `seen` (from intro_seen) switches to the short version.
 *  Nothing plays until the child taps Start - that tap also unlocks audio for
 *  the rest of the session.
 *
 *  lines : [{ id, text }] already in the child's language
 *  vars  : placeholder values ({letter}, {topic}, {name})
 *  audioIdFor(line) -> audio_id to look up in the manifest (may not exist yet) */
export default function CharacterIntro({ characterId = 'hudi', lines, vars, seen = false, audioIdFor, onDone }) {
  const { t, language } = useLanguage();
  const copy = t('interactive.intro');
  const audio = useAudio();
  const [phase, setPhase] = useState('ready'); // ready | speaking
  const line = useMemo(() => {
    if (!lines?.length) return null;
    return lines[nextRotation(characterId, lines.length)];
  }, [characterId, lines]);
  const finished = useRef(false);

  const text = line ? fill(line.text, vars) : '';
  const audioId = line && audioIdFor ? audioIdFor(line) : null;
  const clip = audioId ? getClip(audioId) : null;
  const { index } = useWordHighlight(text, {
    playing: phase === 'speaking',
    timings: clip?.timings,
  });

  const character = CHARACTERS[characterId];

  function finish() {
    if (finished.current) return;
    finished.current = true;
    onDone?.();
  }

  function handleStart() {
    playTap();
    audio.unlock();
    if (seen || !line) {
      finish();
      return;
    }
    setPhase('speaking');
    const words = text.split(/\s+/).filter(Boolean).length;
    // Fallback timer so the intro always completes even with no clip.
    const fallbackMs = Math.max(2200, words * 420 + 600);
    const timer = setTimeout(finish, fallbackMs);
    if (audioId) {
      audio.play(audioId, {
        fallbackText: text,
        onEnd: () => {
          clearTimeout(timer);
          setTimeout(finish, 350);
        },
      });
    }
  }

  function handleSkip() {
    audio.unlock();
    audio.stop();
    finish();
  }

  if (!line) {
    return null;
  }

  return (
    <div className="card" style={{ background: 'var(--color-sky)', boxShadow: 'none', padding: seen ? 14 : 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <CharacterAvatar
          id={characterId}
          state={phase === 'speaking' ? 'talk' : 'wave'}
          size={seen ? 84 : 120}
          className="ck-slide-in"
        />
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <SpeechBubble text={text} activeIndex={index}>
            {audio.status && (
              <span style={{ display: 'block', marginTop: 8, fontSize: '0.75rem', color: '#8394a3', fontWeight: 700 }}>
                {audio.status === 'coming-soon' && copy.audioComingSoon}
                {audio.status === 'preview' && copy.audioPreview}
                {audio.status === 'tts-preview' && copy.audioTtsPreview}
              </span>
            )}
          </SpeechBubble>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary btn-chunky" onClick={handleStart} disabled={phase === 'speaking'}>
          {seen ? copy.startShort : copy.start.replace('{name}', character ? characterName(character.id, language) : '')}
        </button>
        <button type="button" className="btn btn-outline" onClick={handleSkip}>
          {copy.skip}
        </button>
      </div>
    </div>
  );
}
