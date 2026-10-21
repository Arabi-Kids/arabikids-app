import './animals.css';

export const INK = '#1c1a17';

/** Shared canvas: 120x120, soft ground shadow, the whole drawing bobs gently. */
export function Frame({ children, bob = true, shadow = true }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      {shadow && <ellipse cx="60" cy="112" rx="30" ry="4.5" fill="#1c3550" opacity="0.12" />}
      <g className={`an-part ${bob ? 'an-bob' : ''}`}>{children}</g>
    </svg>
  );
}

/** Dark round eye with a highlight; blinks. */
export function Eye({ x, y, r = 3.6, delay = 0 }) {
  return (
    <g className="an-part an-blink" style={{ animationDelay: `${delay}s` }}>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <circle cx={x + r * 0.34} cy={y - r * 0.34} r={r * 0.38} fill="#fff" />
    </g>
  );
}

export function Blush({ x, y, rx = 5, ry = 3 }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ff8fa3" opacity="0.5" />;
}

/** Wraps a drawing in the sized, class-hooked container used by the app. */
export function ArtBox({ size = 110, label, children }) {
  return (
    <span className="an" style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </span>
  );
}
