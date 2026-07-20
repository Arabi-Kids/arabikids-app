import { useEffect, useRef } from 'react';

const SIZE = 160;
const GUIDE_FONT = `700 ${SIZE * 0.75}px Amiri, serif`;

function drawGuide(ctx) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = 'rgba(27,79,138,0.16)';
  ctx.font = GUIDE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ctx.canvas.dataset.letter, SIZE / 2, SIZE / 2 + SIZE * 0.06);
}

export default function LetterTraceCanvas({ letter }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.dataset.letter = letter;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    let cancelled = false;
    document.fonts.load(GUIDE_FONT).finally(() => {
      if (!cancelled) drawGuide(ctx);
    });
    return () => {
      cancelled = true;
    };
  }, [letter]);

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
    drawGuide(canvasRef.current.getContext('2d'));
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: SIZE,
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
