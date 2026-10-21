import { useMemo, useState } from 'react';
import { playTap, playSuccess } from '../lib/sounds.js';
import { shuffled } from '../lib/contentHelpers.js';

/** "Find the hidden letter": the picture is shown, and the target letter is
 * hidden among other letters. Tap it. A wrong tap shakes gently and the
 * picture stays - never a failure state. */
export default function FindLetterGame({ target, others, picture, word, prompt, doneText, tryAgainText, onWin }) {
  const tiles = useMemo(() => shuffled([target, ...shuffled(others).slice(0, 5)]), [target, others]);
  const [wrong, setWrong] = useState(null);
  const [won, setWon] = useState(false);

  function pick(tile) {
    if (won) return;
    if (tile.id === target.id) {
      playSuccess();
      setWon(true);
      onWin?.();
    } else {
      playTap();
      setWrong(tile.id);
      setTimeout(() => setWrong(null), 500);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', lineHeight: 1.2 }}>{picture}</div>
      <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '1.8rem', margin: '4px 0' }}>{word}</p>
      <p style={{ margin: '4px 0 14px', fontWeight: 800, color: 'var(--color-blue)' }}>
        {won ? doneText : prompt}
      </p>
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
              }}
            >
              <span className="arabic-text" dir="rtl" style={{ display: 'block', textAlign: 'center', fontSize: '2.6rem', lineHeight: 1.8 }}>
                {tile.glyph}
              </span>
            </button>
          );
        })}
      </div>
      {wrong && <p style={{ color: '#8394a3', fontWeight: 700, marginTop: 10 }}>{tryAgainText}</p>}
    </div>
  );
}
