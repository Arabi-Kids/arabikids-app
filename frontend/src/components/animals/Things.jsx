import { Frame, Eye, INK } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;

export function Stick() {
  return (
    <Frame>
      <path d="M44 108 L72 40 Q80 18 62 16 Q44 16 46 34" stroke="#8a5a2c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M44 108 L72 40 Q80 18 62 16 Q44 16 46 34" stroke="#c78c3d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M52 86 l8 3 M58 70 l8 3 M64 54 l8 3" stroke="#8a5a2c" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="44" cy="109" rx="7" ry="3" fill="#3a2e2a" />
    </Frame>
  );
}

export function Big() {
  return (
    <Frame>
      <g className={T('an-pulse')}><circle cx="46" cy="64" r="34" fill="#e0533d" /><circle cx="36" cy="52" r="9" fill="#ff9a8a" opacity="0.8" /></g>
      <circle cx="96" cy="88" r="11" fill="#3d9be0" /><circle cx="92" cy="84" r="3.4" fill="#9fd2f5" />
      <path d="M12 104 H80" stroke="#7a8aa5" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="3 5" opacity="0.0" />
      <g className={T('an-float')}><path d="M96 14 v26 M88 22 l8 -9 l8 9" stroke="#1f9d6a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
    </Frame>
  );
}

export function Desk() {
  return (
    <Frame>
      <rect x="14" y="52" width="92" height="12" rx="4" fill="#c78c3d" />
      <rect x="14" y="60" width="92" height="5" fill="#a8742f" />
      <rect x="22" y="64" width="8" height="44" rx="3" fill="#8a5a2c" /><rect x="90" y="64" width="8" height="44" rx="3" fill="#8a5a2c" />
      <rect x="34" y="64" width="52" height="20" rx="3" fill="#a8742f" /><rect x="52" y="72" width="16" height="4" rx="2" fill="#ffd23f" />
      <rect x="30" y="30" width="34" height="23" rx="2" fill="#3d7bd9" /><rect x="34" y="34" width="26" height="15" fill="#fff" /><path d="M38 40 h18 M38 45 h12" stroke="#9aa8c4" strokeWidth="2" />
      <g className={T('an-o-b an-sway-s')}><rect x="76" y="26" width="6" height="28" rx="2" fill="#ffd23f" transform="rotate(12 79 40)" /><path d="M72 55 l5 -4 l5 -1 Z" fill="#f2c9a0" /></g>
    </Frame>
  );
}

export function Many() {
  const colours = ['#e0533d', '#ffd23f', '#3d9be0', '#4ea85a', '#b78bff', '#ff8a3d'];
  return (
    <Frame>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <g key={`${r}${c}`} className={T('an-float')} style={{ animationDelay: `${(r * 3 + c) * 0.18}s` }}>
          <circle cx={30 + c * 30} cy={32 + r * 30} r="12" fill={colours[(r * 3 + c) % colours.length]} />
          <circle cx={26 + c * 30} cy={28 + r * 30} r="3.4" fill="#fff" opacity="0.7" />
        </g>
      )))}
    </Frame>
  );
}

export function Talk() {
  return (
    <Frame>
      <path d="M14 22 H72 a10 10 0 0 1 10 10 V56 a10 10 0 0 1 -10 10 H40 L24 80 V66 H14 a10 10 0 0 1 -10 -10 V32 a10 10 0 0 1 10 -10 Z" fill="#3d9be0" />
      <g fill="#fff"><circle cx="28" cy="44" r="4" /><circle cx="43" cy="44" r="4" /><circle cx="58" cy="44" r="4" /></g>
      <g className={T('an-pulse')}><path d="M50 62 H106 a10 10 0 0 1 10 10 V92 a10 10 0 0 1 -10 10 H100 V116 L84 102 H60 a10 10 0 0 1 -10 -10 V72 a10 10 0 0 1 10 -10 Z" fill="#ffd23f" /></g>
      <path d="M62 78 h40 M62 88 h28" stroke="#c98f00" strokeWidth="3.4" strokeLinecap="round" />
    </Frame>
  );
}

export function Ten() {
  return (
    <Frame>
      <rect x="12" y="16" width="96" height="88" rx="14" fill="#fff" stroke="#d8dde6" strokeWidth="3" />
      <g className={T('an-pulse')}><text x="60" y="68" textAnchor="middle" fontFamily="Baloo 2, Nunito, system-ui, sans-serif" fontWeight="800" fontSize="46" fill="#3d7bd9">10</text></g>
      <g>{[0, 1, 2, 3, 4].map((i) => <circle key={`a${i}`} cx={28 + i * 16} cy="82" r="5.4" fill="#ffb347" />)}{[0, 1, 2, 3, 4].map((i) => <circle key={`b${i}`} cx={28 + i * 16} cy="95" r="5.4" fill="#4ea85a" />)}</g>
    </Frame>
  );
}

export function Cage() {
  return (
    <Frame>
      <path d="M60 8 V18" stroke="#b8860b" strokeWidth="3.4" strokeLinecap="round" /><circle cx="60" cy="8" r="4" fill="none" stroke="#b8860b" strokeWidth="3" />
      <path d="M22 100 V56 Q22 18 60 18 Q98 18 98 56 V100" fill="rgba(255,255,255,0.35)" stroke="#d4a017" strokeWidth="4" />
      {[34, 47, 60, 73, 86].map((x) => <path key={x} d={`M${x} 98 V${24 + Math.abs(x - 60) * 0.3}`} stroke="#d4a017" strokeWidth="3" strokeLinecap="round" />)}
      <rect x="14" y="98" width="92" height="12" rx="5" fill="#b8860b" /><rect x="14" y="98" width="92" height="4" rx="2" fill="#e3b53a" />
      <path d="M32 76 H88" stroke="#8a5a2c" strokeWidth="3" strokeLinecap="round" />
      <g className={T('an-hop')}>
        <ellipse cx="62" cy="64" rx="15" ry="12" fill="#ffd23f" />
        <circle cx="74" cy="54" r="9" fill="#ffd23f" />
        <path d="M81 54 l8 2 l-8 3 Z" fill="#ff9a2e" />
        <Eye x={75} y={52} r={2.4} />
        <path d="M48 66 q-10 4 -14 12 q10 0 18 -6 Z" fill="#f5bd1f" />
        <path d="M58 76 v4 M66 76 v4" stroke="#ff9a2e" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

export function White() {
  return (
    <Frame shadow={false}>
      <rect x="8" y="14" width="104" height="96" rx="18" fill="#a9d8f7" />
      <g className={T('an-float')}>
        <path d="M30 84 Q16 84 16 70 Q16 56 32 56 Q34 38 54 38 Q70 38 76 52 Q96 48 100 66 Q110 70 106 82 Q104 90 94 90 H34 Q30 90 30 84 Z" fill="#fff" />
        <path d="M36 82 Q30 80 30 72" stroke="#e3eef8" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g className={T('an-float')} style={{ animationDelay: '1.2s' }}><path d="M18 36 q6 -6 14 -2 q8 -4 12 4 H18 Z" fill="#fff" opacity="0.8" /></g>
      <circle cx="94" cy="30" r="8" fill="#fff6c9" opacity="0.9" />
    </Frame>
  );
}

export function Carpet() {
  return (
    <Frame>
      <path d="M22 36 H98 L110 88 H10 Z" fill="#b5352c" />
      <path d="M28 42 H92 L102 82 H18 Z" fill="#e0533d" />
      <path d="M36 50 H84 L92 76 H28 Z" fill="none" stroke="#ffd23f" strokeWidth="3" />
      <path d="M60 52 L72 63 L60 74 L48 63 Z" fill="#ffd23f" /><path d="M60 58 L66 63 L60 68 L54 63 Z" fill="#b5352c" />
      <g fill="#ffd23f"><circle cx="38" cy="63" r="3" /><circle cx="82" cy="63" r="3" /></g>
      <g stroke="#f3e2b3" strokeWidth="2.4" strokeLinecap="round">{[16, 26, 36, 46, 56, 66, 76, 86, 96, 104].map((x) => <path key={x} d={`M${x} 88 v10`} />)}</g>
      <g className={T('an-float')}><path d="M96 20 q4 -8 10 -2" stroke="#7fb9ea" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" /></g>
    </Frame>
  );
}

export function Glasses() {
  return (
    <Frame>
      <circle cx="36" cy="64" r="22" fill="#cfeaff" opacity="0.7" /><circle cx="84" cy="64" r="22" fill="#cfeaff" opacity="0.7" />
      <circle cx="36" cy="64" r="22" fill="none" stroke="#2f4a7a" strokeWidth="6" /><circle cx="84" cy="64" r="22" fill="none" stroke="#2f4a7a" strokeWidth="6" />
      <path d="M58 62 Q60 56 62 62" stroke="#2f4a7a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M14 58 L6 48 M106 58 L114 48" stroke="#2f4a7a" strokeWidth="5" strokeLinecap="round" />
      <g className={T('an-twinkle')}><path d="M26 54 q6 -6 14 -4" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M74 54 q6 -6 14 -4" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Brain() {
  return (
    <Frame>
      <g className={T('an-pulse')}>
        <path d="M60 24 Q46 10 30 24 Q12 26 14 46 Q6 58 16 70 Q14 88 34 92 Q44 106 60 98 Q76 106 86 92 Q106 88 104 70 Q114 58 106 46 Q108 26 90 24 Q74 10 60 24 Z" fill="#f4a6b7" />
        <path d="M60 26 V96" stroke="#d9778f" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M34 40 Q46 44 48 56 M30 66 Q44 62 50 72 M88 40 Q76 44 74 56 M92 66 Q78 62 72 72 M40 84 Q50 80 54 88 M80 84 Q70 80 66 88" stroke="#d9778f" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g className={T('an-twinkle')}><path d="M104 12 v10 M99 17 h10" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
      <g className={T('an-twinkle')} style={{ animationDelay: '0.9s' }}><path d="M14 14 v8 M10 18 h8" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Lock() {
  return (
    <Frame>
      <g className={T('an-o-b an-sway-s')}><path d="M40 56 V40 Q40 14 60 14 Q80 14 80 40 V56" fill="none" stroke="#9aa3b2" strokeWidth="9" strokeLinecap="round" /></g>
      <rect x="26" y="54" width="68" height="54" rx="10" fill="#f0b400" />
      <rect x="26" y="54" width="68" height="14" rx="8" fill="#ffd23f" />
      <circle cx="60" cy="80" r="8" fill="#6b4d00" /><path d="M60 82 V96" stroke="#6b4d00" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

export function Pen() {
  return (
    <Frame>
      <g className={T('an-sway-s')}>
        <path d="M26 98 L82 30 L94 40 L38 108 Z" fill="#3d7bd9" />
        <path d="M82 30 L90 22 Q98 18 102 24 Q106 30 98 34 L94 40 Z" fill="#9aa8c4" />
        <path d="M26 98 L38 108 L22 112 Z" fill="#2f4a7a" />
        <path d="M30 96 L84 33" stroke="#9fc2f5" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 112 L27 104" stroke="#1c1a17" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M30 112 Q44 104 52 112 T76 110" stroke="#3d7bd9" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  );
}

export function Knowledge() {
  return (
    <Frame>
      <path d="M60 20 L108 42 L60 64 L12 42 Z" fill="#2f4a7a" />
      <path d="M32 54 V76 Q60 94 88 76 V54 L60 66 Z" fill="#3d5f98" />
      <path d="M108 42 V74" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" />
      <g className={T('an-o-t an-sway')}><circle cx="108" cy="78" r="5" fill="#ffd23f" /><path d="M108 80 v14" stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" /></g>
      <circle cx="60" cy="42" r="4" fill="#ffd23f" />
      <g className={T('an-twinkle')}><path d="M20 20 v10 M15 25 h10" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Cup() {
  return (
    <Frame>
      <path d="M92 52 Q116 52 112 74 Q108 92 86 92" fill="none" stroke="#2a85cc" strokeWidth="9" strokeLinecap="round" />
      <path d="M22 46 H92 V86 Q92 108 70 108 H44 Q22 108 22 86 Z" fill="#3d9be0" />
      <rect x="22" y="46" width="70" height="10" rx="4" fill="#6cb8ee" />
      <ellipse cx="57" cy="48" rx="31" ry="5" fill="#7a4a2a" />
      <path d="M34 66 V90" stroke="#9fd2f5" strokeWidth="5" strokeLinecap="round" />
      <g className={T('an-rise')}><path d="M46 38 q-6 -10 0 -18" stroke="#cfd8e6" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
      <g className={T('an-rise')} style={{ animationDelay: '1s' }}><path d="M64 38 q-6 -10 0 -18" stroke="#cfd8e6" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Bucket() {
  return (
    <Frame>
      <path d="M30 54 Q60 -4 90 54" fill="none" stroke="#7a8aa5" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 50 H98 L88 108 H32 Z" fill="#e0533d" />
      <path d="M22 50 H98 L96 62 H24 Z" fill="#f1705a" />
      <rect x="20" y="46" width="80" height="8" rx="4" fill="#b53a2e" />
      <path d="M36 70 L40 98" stroke="#ff9a8a" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <g className={T('an-rise')}><path d="M64 36 q4 6 0 10 q-4 -4 0 -10 Z" fill="#7fc4f0" /></g>
      <g className={T('an-rise')} style={{ animationDelay: '1.4s' }}><path d="M80 30 q4 6 0 10 q-4 -4 0 -10 Z" fill="#7fc4f0" /></g>
    </Frame>
  );
}

export function Chair() {
  return (
    <Frame>
      <rect x="34" y="12" width="46" height="46" rx="7" fill="#c78c3d" /><rect x="40" y="18" width="34" height="34" rx="4" fill="#d9a553" />
      <path d="M46 20 V50 M57 20 V50 M68 20 V50" stroke="#c78c3d" strokeWidth="3" />
      <rect x="28" y="56" width="62" height="12" rx="5" fill="#a8742f" />
      <rect x="32" y="66" width="9" height="42" rx="3" fill="#8a5a2c" /><rect x="76" y="66" width="9" height="42" rx="3" fill="#8a5a2c" />
      <rect x="26" y="74" width="7" height="34" rx="3" fill="#a8742f" opacity="0.0" />
      <path d="M41 88 H76" stroke="#8a5a2c" strokeWidth="3.4" strokeLinecap="round" />
    </Frame>
  );
}

export function Lesson() {
  return (
    <Frame>
      <path d="M10 30 Q36 20 60 34 Q84 20 110 30 V96 Q84 86 60 100 Q36 86 10 96 Z" fill="#fff" stroke="#c9d3e3" strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 34 V100" stroke="#c9d3e3" strokeWidth="3" />
      <path d="M20 46 Q34 42 50 50 M20 58 Q34 54 50 62 M20 70 Q34 66 50 74 M70 50 Q86 42 100 46 M70 62 Q86 54 100 58" stroke="#9aa8c4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className={T('an-float')}><path d="M96 66 L104 58 L110 64 L102 72 Z" fill="#ffd23f" /><path d="M96 66 L102 72 L94 74 Z" fill="#f2c9a0" /></g>
      <path d="M10 96 Q36 86 60 100 Q84 86 110 96 V102 Q84 92 60 106 Q36 92 10 102 Z" fill="#3d7bd9" />
    </Frame>
  );
}
