import { useState } from 'react';
import { useGameRound } from './useGameRound.js';
import GameCompleteCard from './GameCompleteCard.jsx';
import { playTap } from '../../lib/sounds.js';

/** Generic tap-to-match game: tap a "left" tile, then tap the matching
 * "right" tile. Refactored from the original Review Hub Play tab (which
 * matched Arabic words to their meanings) into a render-props shape so it
 * also serves word-to-picture matching in the Arabic Curriculum without
 * duplicating the select-then-match state machine. `items` need a stable
 * `id` field; `renderLeft`/`renderRight` receive `(item, state)` where
 * state is `{selected, matched, wrong}`. */
export default function TapMatchGame({ items, renderLeft, renderRight, size = 6, filter, copy, onComplete }) {
  const { roundItems, matchedIds, complete, score, stars, logged, setLogged, markMatched, markMistake, restart } = useGameRound(items, { size, filter });
  const [leftTiles, setLeftTiles] = useState([]);
  const [rightTiles, setRightTiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [wrongId, setWrongId] = useState(null);

  // Re-shuffle two independent tile orders whenever a new round starts.
  if (roundItems.length > 0 && leftTiles.length !== roundItems.length) {
    setLeftTiles([...roundItems].sort(() => Math.random() - 0.5));
    setRightTiles([...roundItems].sort(() => Math.random() - 0.5));
  }

  if (complete && !logged) {
    setLogged(true);
    onComplete?.(score, stars);
  }

  function handleLeftTap(id) {
    if (matchedIds.includes(id)) return;
    playTap();
    setSelectedId(id);
    setWrongId(null);
  }

  function handleRightTap(id) {
    if (matchedIds.includes(id) || selectedId === null) return;
    if (id === selectedId) {
      markMatched(id);
      setSelectedId(null);
    } else {
      setWrongId(id);
      markMistake();
      setTimeout(() => setWrongId(null), 500);
      setSelectedId(null);
    }
  }

  function handleRestart() {
    setLeftTiles([]);
    setRightTiles([]);
    setSelectedId(null);
    setWrongId(null);
    restart();
  }

  if (roundItems.length < 2) return null;

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>{copy.instructions}</p>
      <GameCompleteCard active={complete} stars={stars} title={copy.allMatched} onPlayAgain={handleRestart} playAgainLabel={copy.playAgain} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftTiles.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matchedIds.includes(item.id)}
              onClick={() => handleLeftTap(item.id)}
              className="card"
              style={{
                padding: '12px 10px',
                cursor: matchedIds.includes(item.id) ? 'default' : 'pointer',
                border: `2px solid ${selectedId === item.id ? 'var(--color-gold)' : 'var(--color-blue)'}`,
                background: matchedIds.includes(item.id) ? 'rgba(26,122,74,0.08)' : '#fff',
                opacity: matchedIds.includes(item.id) ? 0.5 : 1,
                textAlign: 'center',
              }}
            >
              {renderLeft(item, { selected: selectedId === item.id, matched: matchedIds.includes(item.id) })}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightTiles.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matchedIds.includes(item.id)}
              onClick={() => handleRightTap(item.id)}
              className="card"
              style={{
                padding: '12px 10px',
                cursor: matchedIds.includes(item.id) ? 'default' : 'pointer',
                border: `2px solid ${wrongId === item.id ? '#c0392b' : 'var(--color-blue)'}`,
                background: matchedIds.includes(item.id) ? 'rgba(26,122,74,0.08)' : '#fff',
                opacity: matchedIds.includes(item.id) ? 0.5 : 1,
                textAlign: 'center',
              }}
            >
              {renderRight(item, { wrong: wrongId === item.id, matched: matchedIds.includes(item.id) })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
