import { useState } from 'react';
import { useGameRound, shuffle } from './useGameRound.js';
import GameCompleteCard from './GameCompleteCard.jsx';
import { playTap } from '../../lib/sounds.js';

/** Flip-card memory game: each round item becomes a word card + a picture
 * card; tap two cards to flip them, a matching pair (same item, one of
 * each kind) stays face-up, a mismatch flips back after a short delay.
 * `items` need a stable `id`; `renderWordFace`/`renderPictureFace`
 * receive `(item)`. */
export default function MemoryGame({ items, renderWordFace, renderPictureFace, size = 6, filter, copy, onComplete }) {
  const { roundItems, matchedIds, complete, score, stars, logged, setLogged, markMatched, markMistake, restart } = useGameRound(items, { size, filter });
  const [cards, setCards] = useState([]);
  const [flippedCardIds, setFlippedCardIds] = useState([]);
  const [busy, setBusy] = useState(false);

  if (roundItems.length > 0 && cards.length !== roundItems.length * 2) {
    setCards(
      shuffle(
        roundItems.flatMap((item) => [
          { cardId: `${item.id}-word`, itemId: item.id, kind: 'word', item },
          { cardId: `${item.id}-picture`, itemId: item.id, kind: 'picture', item },
        ])
      )
    );
    setFlippedCardIds([]);
  }

  if (complete && !logged) {
    setLogged(true);
    onComplete?.(score, stars);
  }

  function handleFlip(card) {
    if (busy || flippedCardIds.includes(card.cardId) || matchedIds.includes(card.itemId)) return;
    playTap();
    const next = [...flippedCardIds, card.cardId];
    setFlippedCardIds(next);
    if (next.length === 2) {
      setBusy(true);
      const [firstId, secondId] = next;
      const first = cards.find((c) => c.cardId === firstId);
      const second = cards.find((c) => c.cardId === secondId);
      setTimeout(() => {
        if (first.itemId === second.itemId) {
          markMatched(first.itemId);
        } else {
          markMistake();
        }
        setFlippedCardIds([]);
        setBusy(false);
      }, 700);
    }
  }

  function handleRestart() {
    setCards([]);
    restart();
  }

  if (roundItems.length < 2) return null;

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>{copy.instructions}</p>
      <GameCompleteCard active={complete} stars={stars} title={copy.allMatched} onPlayAgain={handleRestart} playAgainLabel={copy.playAgain} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
        {cards.map((card) => {
          const isFaceUp = flippedCardIds.includes(card.cardId) || matchedIds.includes(card.itemId);
          const isMatched = matchedIds.includes(card.itemId);
          return (
            <button
              key={card.cardId}
              type="button"
              disabled={isMatched}
              onClick={() => handleFlip(card)}
              className="card"
              style={{
                padding: '18px 8px',
                minHeight: 64,
                cursor: isMatched ? 'default' : 'pointer',
                border: `2px solid ${isMatched ? 'var(--color-teal)' : 'var(--color-blue)'}`,
                background: isMatched ? 'rgba(26,122,74,0.08)' : isFaceUp ? '#fff' : 'var(--color-sky)',
                opacity: isMatched ? 0.5 : 1,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFaceUp ? (card.kind === 'word' ? renderWordFace(card.item) : renderPictureFace(card.item)) : (
                <span style={{ fontSize: '1.5rem', color: 'var(--color-blue)' }}>?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
