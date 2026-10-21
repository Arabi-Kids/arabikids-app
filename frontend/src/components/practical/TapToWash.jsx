import { useState } from 'react';
import CharacterAvatar from '../characters/CharacterAvatar.jsx';
import { playTap, playSuccess } from '../../lib/sounds.js';
import { localized } from '../../lib/contentHelpers.js';
import { WuduIcon, DropIcon, CheckIcon } from './shared.jsx';

// Washes per part (the pack: repeat 3 times, right before left). WD-07 (wipe
// the head) is a single wipe here: the pack flags its repetition wording for
// the reviewer, so the game does not assert a count for it.
const REPS = { 'WD-07': 1 };
const DEFAULT_REPS = 3;

/** Each body part glows in turn; tap it to "wash" with water drops. Tapping
 * out of order gently shakes and keeps the order (never negative). */
export default function TapToWash({ parts, demonstratorId, language, copy, onDone }) {
  const [index, setIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [shakeId, setShakeId] = useState(null);
  const [cheer, setCheer] = useState(false);
  const finished = index >= parts.length;

  function repsFor(part) {
    return REPS[part.id] ?? DEFAULT_REPS;
  }

  function handleTap(part, i) {
    if (finished) return;
    if (i !== index) {
      setShakeId(part.id);
      setTimeout(() => setShakeId(null), 450);
      return;
    }
    playTap();
    const next = taps + 1;
    if (next >= repsFor(part)) {
      playSuccess();
      setTaps(0);
      setIndex(index + 1);
      setCheer(true);
      setTimeout(() => setCheer(false), 700);
      if (index + 1 >= parts.length) onDone?.();
    } else {
      setTaps(next);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <CharacterAvatar id={demonstratorId} state={finished || cheer ? 'cheer' : 'point'} size={96} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {parts.map((part, i) => {
          const done = i < index;
          const active = i === index && !finished;
          const reps = repsFor(part);
          return (
            <button
              key={part.id}
              type="button"
              onClick={() => handleTap(part, i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 16,
                cursor: done ? 'default' : 'pointer',
                border: `3px solid ${done ? 'var(--color-green)' : active ? 'var(--color-gold)' : '#d6dde6'}`,
                background: done ? 'rgba(26,122,74,0.08)' : active ? 'rgba(240,185,61,0.18)' : '#fff',
                boxShadow: active ? '0 0 0 4px rgba(240,185,61,0.35)' : 'none',
                opacity: !done && !active ? 0.6 : 1,
                animation: shakeId === part.id ? 'washShake 0.4s' : undefined,
              }}
            >
              <span style={{ display: 'inline-flex', width: 42, justifyContent: 'center' }}>{done ? <CheckIcon size={34} /> : <WuduIcon id={part.id} size={40} />}</span>
              <span style={{ flex: 1, fontWeight: 700, color: 'var(--color-text)' }}>{localized(part, language)}</span>
              <span aria-hidden="true" style={{ whiteSpace: 'nowrap', fontSize: '1.1rem' }}>
                {Array.from({ length: reps }, (_, k) => (
                  <DropIcon key={k} size={20} filled={done || (active && k < taps)} style={{ marginLeft: 2 }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', color: '#8ea0b6', fontSize: '0.85rem', margin: '12px 0 0' }}>
        {finished ? copy.washAllDone : copy.washHelp}
      </p>
      <style>{`@keyframes washShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@media (prefers-reduced-motion: reduce) { @keyframes washShake { 0%,100%{transform:none} } }`}</style>
    </div>
  );
}
