import { useEffect, useState } from 'react';

const COLORS = ['var(--color-gold)', 'var(--color-blue)', 'var(--color-teal)', 'var(--color-purple)', 'var(--color-orange)', 'var(--color-green)'];
const PIECE_COUNT = 18;

/** Pure-CSS celebration burst, no library. Renders nothing until `active`
 * flips true, then shows ~1.6s of falling colored pieces and clears itself -
 * safe to leave mounted anywhere (e.g. always rendered at the bottom of
 * Lesson.jsx, toggled by the `completed` state). */
export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) return undefined;
    setPieces(
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1 + Math.random() * 0.6,
        color: COLORS[i % COLORS.length],
        rotate: Math.round(Math.random() * 360),
        isCircle: Math.random() > 0.5,
      }))
    );
    const timer = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: p.isCircle ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
