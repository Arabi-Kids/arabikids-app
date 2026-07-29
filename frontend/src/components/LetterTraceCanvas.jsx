import { useEffect, useRef, useState } from 'react';
import { SHAPES } from './LetterPositions.jsx';

const SIZE = 160;
const FORM_LABELS = { isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' };

function drawGuide(ctx, width, guideFont) {
  ctx.clearRect(0, 0, width, SIZE);
  ctx.fillStyle = 'rgba(27,79,138,0.16)';
  ctx.font = guideFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ctx.canvas.dataset.glyph, width / 2, SIZE / 2 + SIZE * 0.06);
}

// `width`/`fontScale` let a caller trace a whole multi-character word (the
// Review Hub's Write tab) instead of a single letter - defaults reproduce
// the original single-letter sizing exactly, so every existing call site is
// unaffected.
export default function LetterTraceCanvas({ letter, positions, width = SIZE, fontScale = 0.75 }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [form, setForm] = useState('isolated');
  const guideFont = `700 ${SIZE * fontScale}px Amiri, serif`;

  // Only offer positions this letter actually takes (e.g. alif only has
  // "final" since it never connects to what follows it).
  const forms = ['isolated', ...['initial', 'medial', 'final'].filter((pos) => positions?.[pos])];
  const glyph = SHAPES[form](letter);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = SIZE * dpr;
    canvas.dataset.glyph = glyph;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    let cancelled = false;
    document.fonts.load(guideFont).finally(() => {
      if (!cancelled) drawGuide(ctx, width, guideFont);
    });
    return () => {
      cancelled = true;
    };
  }, [glyph, width, guideFont]);

  function pointFromEvent(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointFromEvent(e);
  }

  function handlePointerMove(e) {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const point = pointFromEvent(e);
    ctx.strokeStyle = 'var(--color-blue, #1b4f8a)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
  }

  function handlePointerUp() {
    drawing.current = false;
  }

  function handleClear() {
    drawGuide(canvasRef.current.getContext('2d'), width, guideFont);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {forms.length > 1 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {forms.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setForm(f)}
              style={{
                background: form === f ? 'var(--color-blue)' : '#fff',
                color: form === f ? '#fff' : 'var(--color-blue)',
                border: '2px solid var(--color-blue)',
                borderRadius: 999,
                padding: '2px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {FORM_LABELS[f]}
            </button>
          ))}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width,
          height: SIZE,
          maxWidth: '100%',
          touchAction: 'none',
          background: '#fff',
          border: '2px solid var(--color-blue)',
          borderRadius: 'var(--radius-md)',
          cursor: 'crosshair',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <button
        type="button"
        onClick={handleClear}
        style={{
          display: 'block',
          margin: '8px auto 0',
          background: 'none',
          border: 'none',
          color: '#8ea0b6',
          fontSize: '0.8rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Clear
      </button>
    </div>
  );
}
