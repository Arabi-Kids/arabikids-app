import { cloneElement } from 'react';

// Amal — girl character in a hijab + modest dress, for Pillar 2/3
// illustrations (wudu/salah steps, Seerah scenes). Same viewBox/pose API as
// HudMascot.jsx / ZaydMascot.jsx so all three drop in interchangeably.
const SKIN = '#f2c299';
const DRESS = '#fdfdfd';
const DRESS_DARK = '#d8d4c8';
const HIJAB = '#6ec6c1';
const HIJAB_DARK = '#4a9d97';
const DARK = '#1c1a17';
const CHEEK = '#f5a3a3';
const SHOE = '#e05a5a';
const FLOWER_PINK = '#ef8bc4';
const FLOWER_CENTER = '#ffd35a';

function Face({ pose }) {
  return (
    <>
      <circle cx="80" cy="88" r="29" fill={SKIN} />
      {/* eyebrows */}
      <path d="M65 78 Q70 75 75 78" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M85 78 Q90 75 95 78" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {pose === 'lost' ? (
        <path d="M68 88 Q74 83 80 88" stroke={DARK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="71" cy="89" r="6.4" fill={DARK} />
          <circle cx="89" cy="89" r="6.4" fill={DARK} />
          <circle cx="73.2" cy="86.6" r="2" fill="#fff" />
          <circle cx="91.2" cy="86.6" r="2" fill="#fff" />
        </>
      )}
      <path d="M70 99 Q80 105 90 99" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="98" r="5.2" fill={CHEEK} opacity="0.55" />
      <circle cx="100" cy="98" r="5.2" fill={CHEEK} opacity="0.55" />
    </>
  );
}

function Flower() {
  // Small decorative flower pinned at the temple, matching the reference.
  const petals = [0, 72, 144, 216, 288].map((deg) => (
    <ellipse
      key={deg}
      cx="0"
      cy="-5.5"
      rx="4"
      ry="5.5"
      fill={FLOWER_PINK}
      transform={`rotate(${deg})`}
    />
  ));
  return (
    <g transform="translate(50, 62)">
      {petals}
      <circle cx="0" cy="0" r="3.4" fill={FLOWER_CENTER} />
    </g>
  );
}

function Hijab() {
  // Two-part shape: a tight cap that hugs the face (only a small margin over
  // the face circle at cheek height) plus a wider lower ellipse that flares
  // naturally down toward the shoulders - a plain single big ellipse reads
  // as a hood/hair sitting behind the head rather than fabric wrapping it.
  return (
    <>
      <ellipse cx="80" cy="132" rx="45" ry="38" fill={HIJAB} />
      <ellipse cx="80" cy="83" rx="34" ry="43" fill={HIJAB} />
      {/* clean forehead edge where the fabric meets the face */}
      <path d="M51 76 Q80 60 109 76" stroke={HIJAB_DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* drape folds down each side - kept short, well inside the hijab's own
          boundary, so they read as fabric creases rather than loose cords */}
      <path d="M49 74 Q45 92 47 108" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M111 74 Q115 92 113 108" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <Flower />
    </>
  );
}

function ClaspedHands() {
  return (
    <>
      <ellipse cx="80" cy="141" rx="10" ry="7.5" fill={SKIN} />
      <path d="M70 141 Q80 146 90 141" stroke={DRESS_DARK} strokeWidth="1.4" fill="none" opacity="0.6" />
    </>
  );
}

function Body({ pose }) {
  const tilt = pose === 'lost' ? 'rotate(-6 80 124)' : undefined;
  return (
    <g transform={tilt}>
      <Hijab />
      <path d="M50 156 Q50 110 80 108 Q110 110 110 156 Z" fill={DRESS} />
      <path d="M50 156 Q50 110 80 108 Q110 110 110 156" stroke={DRESS_DARK} strokeWidth="2" fill="none" />
      {/* red shoes peeking out beneath the hem */}
      <ellipse cx="68" cy="156" rx="8" ry="4.5" fill={SHOE} />
      <ellipse cx="92" cy="156" rx="8" ry="4.5" fill={SHOE} />
      {/* Arms are outlined (a slightly wider DRESS_DARK stroke underneath a
          narrower DRESS one) so the white sleeves stay visible against the
          white dress instead of blending into it invisibly. */}
      {pose === 'celebrate' ? (
        <>
          <path d="M64 114 Q42 98 38 72" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M96 114 Q118 98 122 72" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M64 114 Q42 98 38 72" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M96 114 Q118 98 122 72" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
        </>
      ) : pose === 'lost' ? (
        <>
          <path d="M62 118 Q48 128 52 140" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M98 116 Q114 110 116 94" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M62 118 Q48 128 52 140" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M98 116 Q114 110 116 94" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M62 116 Q56 130 68 142" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M98 116 Q104 130 92 142" stroke={DRESS_DARK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M62 116 Q56 130 68 142" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M98 116 Q104 130 92 142" stroke={DRESS} strokeWidth="10" fill="none" strokeLinecap="round" />
          <ClaspedHands />
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
    <svg viewBox="30 26 100 98" role="img" aria-label="Amal">
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
