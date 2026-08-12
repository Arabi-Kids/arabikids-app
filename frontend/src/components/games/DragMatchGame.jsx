import { useRef, useState } from 'react';
import { useGameRound, shuffle } from './useGameRound.js';
import GameCompleteCard from './GameCompleteCard.jsx';
import { playTap } from '../../lib/sounds.js';

/** Drag-and-drop word-to-picture matching game. Uses Pointer Events, not
 * HTML5 Drag-and-Drop - HTML5 DnD's touch support is unreliable on mobile
 * Safari/Chrome without polyfills, a hard blocker for a tablet-used kids'
 * app. Pointer Events work uniformly across mouse/touch/pen with zero
 * polyfill. `items` need a stable `id`; `renderChip`/`renderTarget`
 * receive `(item)`. CSS transform-based drag (delta from pointerdown, not
 * absolute positioning) so a missed drop snaps back via a CSS transition. */
export default function DragMatchGame({ items, renderChip, renderTarget, size = 6, filter, copy, onComplete }) {
  const { roundItems, matchedIds, complete, score, stars, logged, setLogged, markMatched, markMistake, restart } = useGameRound(items, { size, filter });
  const [chipOrder, setChipOrder] = useState([]);
  const [targetOrder, setTargetOrder] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const [missedId, setMissedId] = useState(null);
  const startPos = useRef({ x: 0, y: 0 });
  const targetRefs = useRef({});

  if (roundItems.length > 0 && chipOrder.length !== roundItems.length) {
    setChipOrder(shuffle(roundItems));
    setTargetOrder(shuffle(roundItems));
  }

  if (complete && !logged) {
    setLogged(true);
    onComplete?.(score, stars);
  }

  function handlePointerDown(e, id) {
    if (matchedIds.includes(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
    setMissedId(null);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragDelta({ x: 0, y: 0 });
  }

  function handlePointerMove(e) {
    if (dragId === null) return;
    setDragDelta({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  }

  function handlePointerUp(e) {
    if (dragId === null) return;
    let hitId = null;
    for (const [id, node] of Object.entries(targetRefs.current)) {
      if (!node || matchedIds.includes(id)) continue;
      const rect = node.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        hitId = id;
        break;
      }
    }
    if (hitId !== null && String(hitId) === String(dragId)) {
      playTap();
      markMatched(dragId);
    } else if (hitId !== null) {
      markMistake();
      setMissedId(dragId);
      setTimeout(() => setMissedId(null), 400);
    }
    setDragId(null);
    setDragDelta({ x: 0, y: 0 });
  }

  function handleRestart() {
    setChipOrder([]);
    setTargetOrder([]);
    setDragId(null);
    restart();
  }

  if (roundItems.length < 2) return null;

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>{copy.instructions}</p>
      <GameCompleteCard active={complete} stars={stars} title={copy.allMatched} onPlayAgain={handleRestart} playAgainLabel={copy.playAgain} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chipOrder.map((item) => {
            const isDragging = dragId === item.id;
            const isMatched = matchedIds.includes(item.id);
            const isMissed = missedId === item.id;
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="card"
                style={{
                  padding: '12px 10px',
                  textAlign: 'center',
                  touchAction: 'none',
                  cursor: isMatched ? 'default' : 'grab',
                  border: `2px solid ${isMissed ? '#c0392b' : 'var(--color-blue)'}`,
                  background: isMatched ? 'rgba(26,122,74,0.08)' : '#fff',
                  opacity: isMatched ? 0.4 : 1,
                  pointerEvents: isMatched ? 'none' : 'auto',
                  transform: isDragging ? `translate(${dragDelta.x}px, ${dragDelta.y}px)` : undefined,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  zIndex: isDragging ? 10 : 1,
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {renderChip(item)}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {targetOrder.map((item) => (
            <div
              key={item.id}
              ref={(node) => {
                targetRefs.current[item.id] = node;
              }}
              className="card"
              style={{
                padding: '12px 10px',
                textAlign: 'center',
                border: `2px dashed ${matchedIds.includes(item.id) ? 'var(--color-teal)' : 'var(--color-blue)'}`,
                background: matchedIds.includes(item.id) ? 'rgba(26,122,74,0.08)' : 'rgba(27,79,138,0.03)',
                opacity: matchedIds.includes(item.id) ? 0.6 : 1,
              }}
            >
              {renderTarget(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
