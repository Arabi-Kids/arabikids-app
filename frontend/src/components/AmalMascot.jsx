import { cloneElement } from 'react';

// Amal — girl character in a full draping hijab + modest dress, for
// Pillar 2/3 illustrations (wudu/salah steps, Seerah scenes). Same
// viewBox/pose API as HudMascot.jsx / ZaydMascot.jsx so all three drop in
// interchangeably. Styled after a soft "plush toy" reference: a cloak-style
// hijab that drapes over the shoulders (not just a headscarf), simple dot
// eyes, small nose, rosy cheeks.
const SKIN = '#f2c299';
const DRESS = '#f3b8c4';
const DRESS_DARK = '#e08fa0';
const HIJAB = '#cda67d';
const HIJAB_DARK = '#a67c52';
const UNDERSCARF = '#f7f1e4';
const DARK = '#1c1a17';
const CHEEK = '#f5a3a3';
const SHOE = '#f0dcc8';

function Eye({ cx, cy }) {
  // Simple solid dot + highlight - bold and legible at the small sizes these
  // render at sitewide, and reads as soft/friendly rather than a multi-ring
  // "doll eye".
  const x = Number(cx);
  const y = Number(cy);
  return (
    <>
      <circle cx={x} cy={y} r="5.6" fill={DARK} />
      <circle cx={x - 1.7} cy={y - 1.8} r="1.7" fill="#fff" />
    </>
  );
}

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
          <Eye cx={71} cy={89} />
          <Eye cx={89} cy={89} />
        </>
      )}
      {/* small nose */}
      <path d="M78.5 93 Q80 96.5 81.5 93" stroke={DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M70 99 Q80 105 90 99" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="98" r="5.2" fill={CHEEK} opacity="0.55" />
      <circle cx="100" cy="98" r="5.2" fill={CHEEK} opacity="0.55" />
    </>
  );
}

function Hijab() {
  // A thin pale underscarf ring peeking out from behind the main hijab
  // shape, matching the reference's "underscarf visible at the hairline"
  // detail, plus short fold creases kept inside the hijab's own boundary.
  return (
    <>
      <ellipse cx="80" cy="91" rx="39" ry="49" fill={UNDERSCARF} />
      <ellipse cx="80" cy="91" rx="36" ry="46" fill={HIJAB} />
      <path d="M52 84 Q49 96 51 106" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M108 84 Q111 96 109 106" stroke={HIJAB_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

function Body({ pose }) {
  const tilt = pose === 'lost' ? 'rotate(-6 80 124)' : undefined;
  return (
    <g transform={tilt}>
      <Hijab />
      {/* outer cloak - drapes over the shoulders like a robe rather than
          stopping at the collar, matching the reference silhouette */}
      <path d="M44 158 Q38 120 50 100 Q64 92 80 92 Q96 92 110 100 Q122 120 116 158 Z" fill={HIJAB} />
      <path d="M50 100 Q64 92 80 92 Q96 92 110 100" stroke={HIJAB_DARK} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* pink under-dress peeking through the front */}
      <path d="M66 158 Q62 128 68 106 Q80 101 92 106 Q98 128 94 158 Z" fill={DRESS} stroke={DRESS_DARK} strokeWidth="1.5" />
      {/* shoes peeking out beneath the hem */}
      <ellipse cx="70" cy="157" rx="7" ry="4" fill={SHOE} />
      <ellipse cx="90" cy="157" rx="7" ry="4" fill={SHOE} />
      {pose === 'celebrate' ? (
        <>
          <path d="M58 112 Q38 98 34 74" stroke={HIJAB} strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M102 112 Q122 98 126 74" stroke={HIJAB} strokeWidth="14" fill="none" strokeLinecap="round" />
        </>
      ) : pose === 'lost' ? (
        <>
          <path d="M56 118 Q44 128 48 140" stroke={HIJAB} strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M104 116 Q118 110 120 96" stroke={HIJAB} strokeWidth="14" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* hands tucked into the cloak's sleeves, just peeking out */}
          <ellipse cx="46" cy="128" rx="7" ry="6" fill={SKIN} />
          <ellipse cx="114" cy="128" rx="7" ry="6" fill={SKIN} />
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
