import { useEffect, useMemo, useRef, useState } from 'react';
import { playTap, playSuccess } from '../lib/sounds.js';
import { shuffled } from '../lib/contentHelpers.js';
import CharacterAvatar from './characters/CharacterAvatar.jsx';
import SpeechBubble from './characters/SpeechBubble.jsx';

/** "Find the letter": Hudi says which letter to find, the child taps one.
 * A wrong tap makes Hudi say "This is not <letter>" and the child keeps trying
 * until they find it, then Hudi says "Mashallah, you found it!". Never a failure
 * state. `audio` is the useAudio() object; `ids` are the clip ids and `text` the
 * matching on-screen lines ({ ask, wrong, ok }). */
export default function FindLetterGame({ target, others, picture, word, audio, ids, text, onWin }) {
  const tiles = useMemo(() => shuffled([target, ...shuffled(others).slice(0, 5)]), [target, others]);
  const [wrong, setWrong] = useState(null);
  const [won, setWon] = useState(false);
  const [line, setLine] = useState('ask');
  const [talking, setTalking] = useState(false);
  const timer = useRef(null);

  function say(kind) {
    setLine(kind);
    setTalking(true);
    const result = audio.play(ids[kind], {
      fallbackText: text[kind],
      onStart: () => setTalking(true),
      onEnd: () => setTalking(false),
    });
    // No clip playing (missing or audio not unlocked yet): stop the beak after a moment.
    if (result === 'missing' || result === 'locked') {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTalking(false), 1600);
    }
  }

  useEffect(() => {
    // Hudi asks as soon as the game opens (stays silent if the browser has not
    // been tapped yet; the "Hear Hudi again" button always works).
    const t = setTimeout(() => say('ask'), 450);
    return () => {
      clearTimeout(t);
      clearTimeout(timer.current);
      audio.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(tile) {
    if (won) return;
    audio.unlock();
    if (tile.id === target.id) {
      playSuccess();
      setWon(true);
      say('ok');
      onWin?.();
    } else {
      playTap();
      setWrong(tile.id);
      setTimeout(() => setWrong(null), 600);
      say('wrong');
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <CharacterAvatar id="hudi" state={won ? 'cheer' : talking ? 'talk' : 'idle'} size={84} />
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <SpeechBubble text={text[line]} activeIndex={-1} />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginBottom: 12, padding: '6px 16px' }}
        onClick={() => {
          audio.unlock();
          say(won ? 'ok' : 'ask');
        }}
      >
        🔊 {text.hearAgain}
      </button>
      {audio.status === 'coming-soon' && <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#8394a3' }}>{text.comingSoon}</p>}
      <div style={{ fontSize: '4rem', lineHeight: 1.2 }}>{picture}</div>
      <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '1.8rem', margin: '4px 0 14px' }}>{word}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 360, margin: '0 auto' }}>
        {tiles.map((tile) => {
          const isTarget = tile.id === target.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => pick(tile)}
              style={{
                borderRadius: 18,
                padding: '8px 0',
                cursor: won ? 'default' : 'pointer',
                border: `3px solid ${won && isTarget ? 'var(--color-green)' : wrong === tile.id ? 'var(--color-orange)' : 'var(--color-blue)'}`,
                background: won && isTarget ? 'rgba(26,122,74,0.1)' : wrong === tile.id ? 'rgba(232,130,60,0.1)' : '#fff',
                boxShadow: '0 3px 0 var(--color-blue-dark)',
                transform: wrong === tile.id ? 'translateX(3px)' : undefined,
              }}
            >
              <span className="arabic-text" dir="rtl" style={{ display: 'block', textAlign: 'center', fontSize: '2.6rem', lineHeight: 1.8 }}>
                {tile.glyph}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
