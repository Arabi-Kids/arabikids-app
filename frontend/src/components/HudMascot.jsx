import { cloneElement } from 'react';

// Hud the hoopoe — recurring guide character (see design pitch: Surah An-Naml's messenger bird).
const HEAD_CREST = (
  <>
    <path d="M69 60 L65 39 L74 55 Z" fill="#c1602c" />
    <path d="M78 56 L78 33 L85 53 Z" fill="#c1602c" />
    <path d="M87 60 L92 41 L90 56 Z" fill="#c1602c" />
    <path d="M65 40 L61 32 L69 38 Z" fill="#1c1a17" />
    <path d="M78 34 L75 26 L81 32 Z" fill="#1c1a17" />
    <path d="M91 42 L95 33 L88 38 Z" fill="#1c1a17" />
  </>
);

function HeroBody({ pose }) {
  const wingUp = pose === 'celebrate';
  const tilt = pose === 'lost' ? 'rotate(-8 78 96)' : undefined;
  return (
    <g transform={tilt}>
      <ellipse cx="80" cy="108" rx="30" ry="26" fill="#e8c98f" />
      {wingUp ? (
        <>
          <path d="M60 100 Q40 78 52 58 Q56 82 68 96 Z" fill="#f4ede0" />
          <path d="M56 84 Q48 76 52 66" stroke="#1c1a17" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M56 96 Q52 116 74 126 Q62 110 66 98 Z" fill="#f4ede0" />
          <path d="M60 102 Q58 112 70 120" stroke="#1c1a17" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      <path d="M92 120 Q118 138 112 168" stroke="#c1602c" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="76" r="19" fill="#e8c98f" />
      {HEAD_CREST}
      <path d="M56 80 Q35 82 33 86 Q35 90 56 88 Z" fill="#1c1a17" />
      {pose === 'lost' ? (
        <path d="M67 74 Q72 70 77 74" stroke="#1c1a17" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="72" cy="74" r="3.6" fill="#1c1a17" />
          <circle cx="73.2" cy="72.8" r="1" fill="#fff" />
        </>
      )}
    </g>
  );
}

const POSES = {
  hero: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Hud the hoopoe">
      <HeroBody pose="hero" />
    </svg>
  ),
  celebrate: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Hud the hoopoe celebrating">
      <path d="M30 40 L34 48 M100 24 L98 34 M130 60 L120 64" stroke="#c8960c" strokeWidth="3" strokeLinecap="round" />
      <HeroBody pose="celebrate" />
    </svg>
  ),
  lost: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Hud the hoopoe looking lost">
      <text x="98" y="44" fontSize="26" fontWeight="800" fill="#c1602c" fontFamily="system-ui, sans-serif">?</text>
      <HeroBody pose="lost" />
    </svg>
  ),
  mark: (
    <svg viewBox="30 24 70 70" role="img" aria-label="Hud the hoopoe">
      <HeroBody pose="hero" />
    </svg>
  ),
};

export default function HudMascot({ pose = 'hero', size = 120, className, style }) {
  const svg = POSES[pose] ?? POSES.hero;
  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, ...style }}
    >
      {cloneElement(svg, { style: { width: '100%', height: '100%' } })}
    </span>
  );
}
