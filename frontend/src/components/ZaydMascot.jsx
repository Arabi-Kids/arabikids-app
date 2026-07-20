import { cloneElement } from 'react';

// Zayd — boy character in a thobe + kufi, for Pillar 2/3 illustrations
// (wudu/salah steps, Seerah scenes). Same viewBox/pose API as HudMascot.jsx
// so the two drop in interchangeably wherever a mascot is used.
const SKIN = '#d9a066';
const THOBE = '#3f8f6f';
const THOBE_DARK = '#357a5f';
const KUFI = '#f4ede0';
const TRIM = '#c8960c';
const DARK = '#1c1a17';

function Face({ pose }) {
  return (
    <>
      <circle cx="80" cy="82" r="27" fill={SKIN} />
      {/* kufi cap */}
      <path d="M55 72 Q80 40 105 72 Q80 62 55 72 Z" fill={KUFI} />
      <path d="M57 70 Q80 62 103 70" stroke={TRIM} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* face */}
      {pose === 'lost' ? (
        <path d="M68 82 Q74 78 80 82" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="71" cy="82" r="3.2" fill={DARK} />
          <circle cx="89" cy="82" r="3.2" fill={DARK} />
          <circle cx="72.2" cy="80.8" r="0.9" fill="#fff" />
          <circle cx="90.2" cy="80.8" r="0.9" fill="#fff" />
        </>
      )}
      <path d="M70 92 Q80 99 90 92" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="62" cy="90" r="4" fill="#e8875f" opacity="0.35" />
      <circle cx="98" cy="90" r="4" fill="#e8875f" opacity="0.35" />
    </>
  );
}

function Body({ pose }) {
  const tilt = pose === 'lost' ? 'rotate(-6 80 118)' : undefined;
  return (
    <g transform={tilt}>
      <path d="M50 150 Q50 100 80 98 Q110 100 110 150 Z" fill={THOBE} />
      <path d="M50 150 Q50 100 80 98 Q110 100 110 150" stroke={THOBE_DARK} strokeWidth="2" fill="none" />
      {pose === 'celebrate' ? (
        <>
          <path d="M62 104 Q38 88 34 62" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M98 104 Q122 88 126 62" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      ) : pose === 'lost' ? (
        <>
          <path d="M60 108 Q46 118 50 132" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M100 106 Q116 100 118 84" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M58 108 Q48 128 56 148" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M102 108 Q112 128 104 148" stroke={THOBE} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      )}
      <Face pose={pose} />
    </g>
  );
}

const POSES = {
  hero: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Zayd">
      <Body pose="hero" />
    </svg>
  ),
  celebrate: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Zayd celebrating">
      <path d="M28 44 L32 52 M132 44 L128 52 M80 20 L80 30" stroke={TRIM} strokeWidth="3" strokeLinecap="round" />
      <Body pose="celebrate" />
    </svg>
  ),
  lost: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Zayd looking lost">
      <text x="100" y="46" fontSize="26" fontWeight="800" fill={TRIM} fontFamily="system-ui, sans-serif">?</text>
      <Body pose="lost" />
    </svg>
  ),
  mark: (
    <svg viewBox="30 28 100 90" role="img" aria-label="Zayd">
      <Body pose="hero" />
    </svg>
  ),
};

export default function ZaydMascot({ pose = 'hero', size = 120, className, style }) {
  const svg = POSES[pose] ?? POSES.hero;
  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, ...style }}>
      {cloneElement(svg, { style: { width: '100%', height: '100%' } })}
    </span>
  );
}
