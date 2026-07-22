import { cloneElement } from 'react';

// Amal — girl character in a hijab + modest dress, for Pillar 2/3
// illustrations (wudu/salah steps, Seerah scenes). Same viewBox/pose API as
// HudMascot.jsx / ZaydMascot.jsx so all three drop in interchangeably.
const SKIN = '#d9a066';
const DRESS = '#3f8f6f';
const DRESS_DARK = '#357a5f';
// Rose/mauve instead of gold - gold read as blonde hair color, which fought
// against the shape reading as fabric. Rose has no hair association.
const HIJAB = '#b5657a';
const HIJAB_DARK = '#8f4d60';
const DARK = '#1c1a17';

function Face({ pose }) {
  return (
    <>
      <circle cx="80" cy="84" r="26" fill={SKIN} />
      {pose === 'lost' ? (
        <path d="M68 84 Q74 80 80 84" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="71" cy="84" r="3.2" fill={DARK} />
          <circle cx="89" cy="84" r="3.2" fill={DARK} />
          <circle cx="72.2" cy="82.8" r="0.9" fill="#fff" />
          <circle cx="90.2" cy="82.8" r="0.9" fill="#fff" />
        </>
      )}
      <path d="M70 94 Q80 101 90 94" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="61" cy="92" r="4" fill="#e8875f" opacity="0.35" />
      <circle cx="99" cy="92" r="4" fill="#e8875f" opacity="0.35" />
    </>
  );
}

function Hijab() {
  // Two-part shape instead of one big ellipse: a TIGHT cap that hugs close
  // around the face (face circle is r=26 at cy=84; this ellipse leaves only
  // ~7px margin at cheek height) plus a WIDER lower drape that flares out
  // toward the shoulders. A single large ellipse the same size everywhere
  // reads as a halo sitting behind the head (hair), not fabric wrapping the
  // face - real hijabs hug the temples/cheeks and only flare out lower down.
  //
  // On top of the shape itself: a clean forehead edge (hair grows in wisps,
  // fabric has a crisp fold line), visible drape folds down each side, and
  // an asymmetric flap hanging past one shoulder (hair falls symmetrically;
  // a wrapped hijab usually doesn't) - these are what read as "cloth".
  return (
    <>
      <ellipse cx="80" cy="128" rx="44" ry="38" fill={HIJAB} />
      <ellipse cx="80" cy="80" rx="33" ry="42" fill={HIJAB} />
      {/* extra flap draping past the left shoulder, wrapped and pinned */}
      <path d="M38 120 Q28 140 38 158 Q52 152 50 130 Z" fill={HIJAB} />
      <circle cx="44" cy="132" r="3.2" fill={HIJAB_DARK} />
      {/* clean forehead edge where the fabric meets the face */}
      <path d="M52 74 Q80 58 108 74" stroke={HIJAB_DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* drape folds, hugging the tight upper cap then following the flare */}
      <path d="M48 68 Q42 100 44 132" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M112 68 Q118 100 116 130" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
    </>
  );
}

function Body({ pose }) {
  const tilt = pose === 'lost' ? 'rotate(-6 80 120)' : undefined;
  return (
    <g transform={tilt}>
      <Hijab />
      <path d="M52 150 Q52 108 80 106 Q108 108 108 150 Z" fill={DRESS} />
      <path d="M52 150 Q52 108 80 106 Q108 108 108 150" stroke={DRESS_DARK} strokeWidth="2" fill="none" />
      {pose === 'celebrate' ? (
        <>
          <path d="M64 112 Q42 96 38 70" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M96 112 Q118 96 122 70" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      ) : pose === 'lost' ? (
        <>
          <path d="M62 116 Q48 126 52 138" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M98 114 Q114 108 116 92" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M60 116 Q50 134 58 150" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M100 116 Q110 134 102 150" stroke={DRESS} strokeWidth="12" fill="none" strokeLinecap="round" />
        </>
      )}
      <Face pose={pose} />
    </g>
  );
}

const POSES = {
  hero: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Amal">
      <Body pose="hero" />
    </svg>
  ),
  celebrate: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Amal celebrating">
      <path d="M28 44 L32 52 M132 44 L128 52 M80 16 L80 26" stroke={HIJAB} strokeWidth="3" strokeLinecap="round" />
      <Body pose="celebrate" />
    </svg>
  ),
  lost: (
    <svg viewBox="0 0 160 160" role="img" aria-label="Amal looking lost">
      <text x="100" y="42" fontSize="26" fontWeight="800" fill={HIJAB} fontFamily="system-ui, sans-serif">?</text>
      <Body pose="lost" />
    </svg>
  ),
  mark: (
    <svg viewBox="30 24 100 96" role="img" aria-label="Amal">
      <Body pose="hero" />
    </svg>
  ),
};

export default function AmalMascot({ pose = 'hero', size = 120, className, style }) {
  const svg = POSES[pose] ?? POSES.hero;
  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, ...style }}>
      {cloneElement(svg, { style: { width: '100%', height: '100%' } })}
    </span>
  );
}
