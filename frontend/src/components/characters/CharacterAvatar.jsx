import { CHARACTERS, BRAND } from '../../lib/characters.config.js';
import './characters.css';

// Layered SVG characters. Every moving piece is its own <g> with a stable
// class (ck-head, ck-arm-l/r, ck-eye, ck-crest, ck-tail, ck-whole) so the
// CSS states in characters.css - and later a Rive/Lottie swap - can address
// parts individually. Drawn to the written reference notes in the spec:
//  - Hudi: beak only (no mouth), crest, curved short tail, large eye.
//  - Amir: gold cap close to the head, thin dark hair line under the cap
//          band, hands at the robe edges.
//  - Nur : hijab, pink dress, hands visible.

const SKIN = '#f2c9a0';
const INK = '#1c1a17';

function StateMarks() {
  return (
    <>
      <g className="ck-mark ck-think-mark" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <circle cx="120" cy="34" r="1.6" fill={INK} />
        <circle cx="128" cy="26" r="2.4" fill={INK} />
        <circle cx="138" cy="16" r="3.4" fill={INK} />
      </g>
      <g className="ck-mark ck-sleep-mark" fill={BRAND.primary} fontFamily="system-ui, sans-serif" fontWeight="800">
        <text x="116" y="34" fontSize="16">z</text>
        <text x="128" y="22" fontSize="12">z</text>
      </g>
    </>
  );
}

function Hudi() {
  return (
    <g className="ck-whole ck-part">
      <path className="ck-tail ck-part" d="M96 118 Q122 128 116 152" stroke="#c1602c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M72 130 V140 M88 130 V140" stroke="#c1602c" strokeWidth="3.5" strokeLinecap="round" />
      <g className="ck-body ck-part">
        <ellipse cx="80" cy="108" rx="28" ry="24" fill="#e8c98f" />
        <ellipse cx="84" cy="114" rx="15" ry="13" fill="#f6e6c4" />
      </g>
      <g className="ck-arm-r ck-part">
        <path d="M62 96 Q42 104 46 130 Q66 124 72 106 Z" fill="#f4ede0" />
        <path d="M54 104 Q50 114 56 122" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <g className="ck-head ck-part">
        <g className="ck-crest ck-part">
          <path d="M69 60 L65 39 L74 55 Z" fill="#c1602c" />
          <path d="M78 56 L78 33 L85 53 Z" fill="#c1602c" />
          <path d="M87 60 L92 41 L90 56 Z" fill="#c1602c" />
          <path d="M65 40 L61 32 L69 38 Z" fill={INK} />
          <path d="M78 34 L75 26 L81 32 Z" fill={INK} />
          <path d="M91 42 L95 33 L88 38 Z" fill={INK} />
        </g>
        <circle cx="78" cy="76" r="19" fill="#e8c98f" />
        <path d="M58 77 Q34 79 31 86 Q35 92 58 87 Z" fill={INK} />
        <g className="ck-eye ck-part">
          <circle cx="71" cy="72" r="5.2" fill={INK} />
          <circle cx="72.8" cy="70.2" r="1.7" fill="#fff" />
        </g>
      </g>
      <StateMarks />
    </g>
  );
}

function Child({ kind }) {
  const girl = kind === 'girl';
  const cloth = girl ? '#e0678f' : BRAND.primary;
  const handR = girl ? 7 : 6;
  return (
    <g className="ck-whole ck-part">
      <g className="ck-body ck-part">
        {girl ? (
          <>
            <path d="M54 102 Q56 90 66 88 H94 Q104 90 106 102 L117 152 H43 Z" fill={cloth} />
            <path d="M43 150 H117" stroke={BRAND.gold} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M52 102 Q52 92 62 90 H98 Q108 92 108 102 L112 152 H48 Z" fill={cloth} />
            <path d="M50 126 H110" stroke={BRAND.gold} strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </g>

      <g className="ck-arm-l ck-part">
        <path d="M58 96 Q42 108 44 126" stroke={cloth} strokeWidth="11" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="130" r={handR} fill={SKIN} />
      </g>
      <g className="ck-arm-r ck-part">
        <path d="M102 96 Q118 108 116 126" stroke={cloth} strokeWidth="11" fill="none" strokeLinecap="round" />
        <circle cx="116" cy="130" r={handR} fill={SKIN} />
      </g>

      <g className="ck-head ck-part">
        {girl ? (
          <>
            <path d="M53 62 Q51 94 66 98 H94 Q109 94 107 62 Q107 34 80 34 Q53 34 53 62 Z" fill="#f2a1bf" />
            <ellipse cx="80" cy="64" rx="17" ry="19" fill={SKIN} />
            <path d="M63 56 Q80 44 97 56" stroke="#f2a1bf" strokeWidth="6" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="58" cy="64" r="4.5" fill={SKIN} />
            <circle cx="102" cy="64" r="4.5" fill={SKIN} />
            <circle cx="80" cy="62" r="22" fill={SKIN} />
            <path d="M59 54 Q80 47 101 54" stroke="#3a2a20" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M57 53 Q56 30 80 30 Q104 30 103 53 Q80 45 57 53 Z" fill={BRAND.gold} />
            <path d="M57 53 Q80 45 103 53" stroke="#c8960c" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        <g className="ck-eye ck-part">
          <circle cx={girl ? 74 : 71} cy="64" r="2.8" fill={INK} />
          <circle cx={girl ? 86 : 89} cy="64" r="2.8" fill={INK} />
        </g>
        <path d={girl ? 'M75 74 Q80 79 85 74' : 'M72 73 Q80 80 88 73'} stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
      <StateMarks />
    </g>
  );
}

/** state: idle | wave | talk | point | cheer | think | sleepy */
export default function CharacterAvatar({ id = 'hudi', state = 'idle', size = 120, className = '', style }) {
  const character = CHARACTERS[id] ?? CHARACTERS.hudi;
  return (
    <span
      className={`ck ck-${state} ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      data-character={character.id}
      data-state={state}
    >
      <svg viewBox="0 0 160 160" role="img" aria-label={`${character.name}, ${state}`}>
        {character.kind === 'hoopoe' ? <Hudi /> : <Child kind={character.kind} />}
      </svg>
    </span>
  );
}
