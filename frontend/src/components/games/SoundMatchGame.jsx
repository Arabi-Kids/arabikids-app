import { useEffect, useState } from 'react';
import { useGameRound, shuffle } from './useGameRound.js';
import GameCompleteCard from './GameCompleteCard.jsx';
import { playTap } from '../../lib/sounds.js';
import { speakSmart } from '../../lib/speech.js';

/** Sound → tap-the-picture matching game. `items` need a stable `id`,
 * `arabic` (used as the speakSmart() fallback), and optional
 * `audioUrl` for a real sound effect. `renderImage(item)` renders the
 * tappable picture tile.
 *
 * TODO(content): real animal/object sound-effect audio isn't sourced yet
 * (flagged to the content team) - until `audioUrl` is set per item, this
 * falls back to speaking the item's Arabic word aloud via TTS so the game
 * is fully playable today. Never silently pretends a spoken word is a
 * real sound effect - it's just what plays until real audio exists. */
export default function SoundMatchGame({ items, renderImage, size = 6, filter, copy, onComplete }) {
  const { roundItems, matchedIds, complete, score, stars, logged, setLogged, markMatched, markMistake, restart } = useGameRound(items, { size, filter });
  const [imageOrder, setImageOrder] = useState([]);
  const [wrongId, setWrongId] = useState(null);

  if (roundItems.length > 0 && imageOrder.length !== roundItems.length) {
    setImageOrder(shuffle(roundItems));
  }

  const current = roundItems.find((item) => !matchedIds.includes(item.id));

  useEffect(() => {
    if (current) playCurrentSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (complete && !logged) {
    setLogged(true);
    onComplete?.(score, stars);
  }

  function playCurrentSound() {
    if (!current) return;
    if (current.audioUrl) {
      new Audio(current.audioUrl).play().catch(() => {});
    } else {
      speakSmart(current.arabic);
    }
  }

  function handleTapImage(id) {
    if (!current || matchedIds.includes(id)) return;
    if (id === current.id) {
      playTap();
      markMatched(id);
    } else {
      markMistake();
      setWrongId(id);
      setTimeout(() => setWrongId(null), 500);
    }
  }

  function handleRestart() {
    setImageOrder([]);
    restart();
  }

  if (roundItems.length < 2) return null;

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>{copy.instructions}</p>
      <GameCompleteCard active={complete} stars={stars} title={copy.allMatched} onPlayAgain={handleRestart} playAgainLabel={copy.playAgain} />
      {!complete && (
        <button
          type="button"
          onClick={playCurrentSound}
          className="btn btn-outline"
          style={{ display: 'block', margin: '0 auto 16px' }}
        >
          🔊 {copy.playAgainSound}
        </button>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {imageOrder.map((item) => {
          const isMatched = matchedIds.includes(item.id);
          const isWrong = wrongId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isMatched}
              onClick={() => handleTapImage(item.id)}
              className="card"
              style={{
                padding: '14px 8px',
                cursor: isMatched ? 'default' : 'pointer',
                border: `2px solid ${isWrong ? '#c0392b' : 'var(--color-blue)'}`,
                background: isMatched ? 'rgba(26,122,74,0.08)' : '#fff',
                opacity: isMatched ? 0.5 : 1,
                textAlign: 'center',
              }}
            >
              {renderImage(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
