import { cloneElement } from 'react';

// Zayd — boy character in a thobe + kufi, for Pillar 2/3 illustrations
// (wudu/salah steps, Seerah scenes). Same viewBox/pose API as HudMascot.jsx
// so the two drop in interchangeably wherever a mascot is used.
const SKIN = '#f2c299';
const HAIR = '#3a2a1e';
const SHIRT = '#2f6bb0';
const SHIRT_DARK = '#1b4f8a';
const KUFI = '#fdfbf6';
const KUFI_OUTLINE = '#c8960c';
const TRIM = '#c8960c';
const DARK = '#1c1a17';
const CHEEK = '#f5a3a3';

function KufiTrim() {
  // Zigzag/diamond trim band, matching the reference cap's patterned edge
  // instead of a single plain stroke.
  const points = [];
  for (let x = 57; x <= 103; x += 7.5) points.push(`${x},68 ${x + 3.75},74`);
  return <polyline points={points.join(' ')} stroke={TRIM} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />;
}

function Eye({ cx, cy }) {
  // Simple solid dot + highlight - bold and legible at the small sizes these
  // render at sitewide, matching Amal's eyes for a consistent pair.
  const x = Number(cx);
  const y = Number(cy);
  return (
    <>
      <circle cx={x} cy={y} r="5.4" fill={DARK} />
      <circle cx={x - 1.6} cy={y - 1.7} r="1.6" fill="#fff" />
    </>
  );
}

function Face({ pose }) {
  return (
    <>
      <circle cx="80" cy="86" r="30" fill={SKIN} />
      {/* short hair peeking out at the temples, below the cap */}
      <path d="M50 82 Q48 72 54 66 Q52 78 56 86 Z" fill={HAIR} />
      <path d="M110 82 Q112 72 106 66 Q108 78 104 86 Z" fill={HAIR} />
      {/* kufi cap - stroked outline so the pale fill still reads clearly
          against light backgrounds instead of blending into them */}
      <path d="M52 70 Q80 36 108 70 Q80 58 52 70 Z" fill={KUFI} stroke={KUFI_OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      <KufiTrim />
      {/* eyebrows */}
      <path d="M64 76 Q69 73 74 76" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M86 76 Q91 73 96 76" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* face */}
      {pose === 'lost' ? (
        <path d="M67 86 Q74 81 81 86" stroke={DARK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <Eye cx={70} cy={87} />
          <Eye cx={90} cy={87} />
        </>
      )}
      {/* small nose */}
      <path d="M78.5 92 Q80 95.5 81.5 92" stroke={DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M68 98 Q80 110 92 98 Q80 106 68 98 Z" fill={DARK} />
      <circle cx="60" cy="96" r="5" fill={CHEEK} opacity="0.55" />
      <circle cx="100" cy="96" r="5" fill={CHEEK} opacity="0.55" />
    </>
  );
}

function Body({ pose }) {
  const tilt = pose === 'lost' ? 'rotate(-6 80 122)' : undefined;
  return (
    <g transform={tilt}>
      <path d="M48 152 Q48 104 80 102 Q112 104 112 152 Z" fill={SHIRT} />
      <path d="M48 152 Q48 104 80 102 Q112 104 112 152" stroke={SHIRT_DARK} strokeWidth="2" fill="none" />
      {/* embroidered placket down the front, matching the reference shirt */}
      <path d="M80 106 L80 150" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.85" />
      <circle cx="80" cy="116" r="2" fill="#fff" opacity="0.9" />
      <circle cx="80" cy="128" r="2" fill="#fff" opacity="0.9" />
      <circle cx="80" cy="140" r="2" fill="#fff" opacity="0.9" />
      {pose === 'celebrate' ? (
        <>
          <path d="M60 108 Q36 92 32 66" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M100 108 Q124 92 128 66" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
        </>
      ) : pose === 'lost' ? (
        <>
          <path d="M58 112 Q44 122 48 136" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M102 110 Q118 104 120 88" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M56 112 Q46 132 54 152" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M104 112 Q114 132 106 152" stroke={SHIRT} strokeWidth="13" fill="none" strokeLinecap="round" />
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
    <svg viewBox="30 30 100 96" role="img" aria-label="Zayd">
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
