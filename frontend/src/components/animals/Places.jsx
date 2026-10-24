import { Frame } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;

export function Door() {
  return (
    <Frame>
      <rect x="28" y="12" width="64" height="100" rx="7" fill="#a8672a" />
      <rect x="35" y="19" width="50" height="88" rx="4" fill="#d9944f" />
      <rect x="41" y="26" width="16" height="32" rx="3" fill="#c4803c" /><rect x="63" y="26" width="16" height="32" rx="3" fill="#c4803c" />
      <rect x="41" y="64" width="16" height="34" rx="3" fill="#c4803c" /><rect x="63" y="64" width="16" height="34" rx="3" fill="#c4803c" />
      <g className={T('an-sway-s')}><circle cx="78" cy="62" r="4.2" fill="#ffd23f" /><circle cx="77" cy="61" r="1.4" fill="#fff6c9" /></g>
    </Frame>
  );
}

export function House() {
  return (
    <Frame>
      <rect x="26" y="52" width="68" height="58" rx="4" fill="#fff0cf" />
      <path d="M16 56 L60 18 L104 56 Z" fill="#e0533d" />
      <path d="M16 56 L104 56 L98 62 L22 62 Z" fill="#c7402c" />
      <rect x="52" y="76" width="18" height="34" rx="3" fill="#a8672a" /><circle cx="66" cy="94" r="1.8" fill="#ffd23f" />
      <rect x="32" y="68" width="16" height="16" rx="2" fill="#9bd4f5" /><path d="M40 68 v16 M32 76 h16" stroke="#fff" strokeWidth="2" />
      <rect x="76" y="68" width="16" height="16" rx="2" fill="#9bd4f5" /><path d="M84 68 v16 M76 76 h16" stroke="#fff" strokeWidth="2" />
      <rect x="78" y="26" width="9" height="20" fill="#b8652a" />
    </Frame>
  );
}

export function School() {
  return (
    <Frame>
      <rect x="14" y="54" width="92" height="56" rx="4" fill="#ffe9b3" />
      <path d="M10 56 L60 30 L110 56 Z" fill="#3d7bd9" />
      <rect x="50" y="76" width="20" height="34" rx="3" fill="#a8672a" />
      <g fill="#9bd4f5"><rect x="22" y="68" width="16" height="16" rx="2" /><rect x="82" y="68" width="16" height="16" rx="2" /><rect x="22" y="90" width="16" height="14" rx="2" /><rect x="82" y="90" width="16" height="14" rx="2" /></g>
      <circle cx="60" cy="46" r="6" fill="#fff" /><path d="M60 42 v4 l3 2" stroke="#1c1a17" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M60 30 V12" stroke="#7a5a3a" strokeWidth="2.4" />
      <g className={T('an-o-l an-sway')}><path d="M60 12 L84 18 L60 24 Z" fill="#e0533d" /></g>
    </Frame>
  );
}

export function Mosque() {
  return (
    <Frame>
      <rect x="18" y="68" width="84" height="42" rx="3" fill="#fff0cf" />
      <path d="M32 68 Q60 14 88 68 Z" fill="#2f9e6a" />
      <path d="M60 22 V10" stroke="#caa43a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M62 8 a5 5 0 1 0 0 8 a4 4 0 1 1 0 -8 Z" fill="#ffd23f" />
      <rect x="8" y="40" width="12" height="70" rx="2" fill="#fff6dd" /><path d="M6 40 L14 22 L22 40 Z" fill="#2f9e6a" />
      <rect x="100" y="40" width="12" height="70" rx="2" fill="#fff6dd" /><path d="M98 40 L106 22 L114 40 Z" fill="#2f9e6a" />
      <path d="M50 110 V90 Q60 78 70 90 V110 Z" fill="#7a5a3a" />
      <g fill="#9bd4f5"><rect x="26" y="80" width="10" height="14" rx="5" /><rect x="84" y="80" width="10" height="14" rx="5" /></g>
      <circle cx="14" cy="32" r="1.8" fill="#ffd23f" /><circle cx="106" cy="32" r="1.8" fill="#ffd23f" />
    </Frame>
  );
}

export function Tower() {
  return (
    <Frame>
      <rect x="38" y="30" width="44" height="80" rx="3" fill="#cfc3ad" />
      <path d="M32 30 h56 v-8 h-8 v6 h-8 v-6 h-8 v6 h-8 v-6 h-8 v6 h-8 v-6 h-8 z" fill="#b8ab93" />
      <path d="M38 44 h44 M38 60 h44 M38 76 h44 M38 92 h44" stroke="#b8ab93" strokeWidth="1.6" />
      <path d="M52 110 V94 Q60 84 68 94 V110 Z" fill="#6b4d33" />
      <rect x="54" y="44" width="12" height="16" rx="6" fill="#3a4a63" />
      <path d="M60 22 V6" stroke="#7a5a3a" strokeWidth="2.2" />
      <g className={T('an-o-l an-sway')}><path d="M60 6 L80 12 L60 18 Z" fill="#e0533d" /></g>
    </Frame>
  );
}

export function Farm() {
  return (
    <Frame>
      <path d="M20 112 Q60 96 100 112 Z" fill="#8fd16a" />
      <rect x="26" y="52" width="68" height="54" rx="3" fill="#d6483a" />
      <path d="M20 54 L60 24 L100 54 Z" fill="#b53a2e" />
      <rect x="46" y="70" width="28" height="36" fill="#fff4e6" /><path d="M46 70 L74 106 M74 70 L46 106" stroke="#d6483a" strokeWidth="3" />
      <circle cx="60" cy="46" r="5" fill="#fff4e6" />
      <path d="M8 104 h14 M8 96 h14" stroke="#a8672a" strokeWidth="3" strokeLinecap="round" /><path d="M12 108 V92 M18 108 V92" stroke="#a8672a" strokeWidth="3" strokeLinecap="round" />
      <g className={T('an-sway-s')}><path d="M100 100 V84 M96 88 Q100 78 104 88 M96 94 Q100 84 104 94" stroke="#e7b93b" strokeWidth="2.6" fill="none" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Cave() {
  return (
    <Frame>
      <path d="M8 110 Q14 40 60 24 Q106 40 112 110 Z" fill="#8c8f9c" />
      <path d="M20 110 Q26 56 60 40 Q94 56 100 110 Z" fill="#a7aab7" />
      <path d="M38 110 V84 Q38 62 60 62 Q82 62 82 84 V110 Z" fill="#2b2733" />
      <path d="M44 110 V90 Q44 72 60 72 Q76 72 76 90 V110 Z" fill="#403a4d" />
      <g className={T('an-twinkle')}><circle cx="56" cy="92" r="2" fill="#ffd23f" /><circle cx="64" cy="88" r="1.6" fill="#ffd23f" /></g>
      <path d="M14 108 q8 -10 18 0 M88 108 q8 -10 18 0" stroke="#6fbf5a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Road() {
  return (
    <Frame shadow={false}>
      <rect x="8" y="20" width="104" height="92" rx="14" fill="#9fdc7a" />
      <path d="M52 20 H68 L100 112 H20 Z" fill="#6c7280" />
      <path d="M60 28 v10 M60 48 v14 M60 74 v18 M60 100 v10" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="26" cy="46" r="9" fill="#4aa352" /><rect x="25" y="52" width="2.6" height="8" fill="#7a5a3a" />
      <circle cx="94" cy="62" r="9" fill="#4aa352" /><rect x="93" y="68" width="2.6" height="8" fill="#7a5a3a" />
      <circle cx="96" cy="32" r="8" fill="#ffd23f" opacity="0.9" />
    </Frame>
  );
}

export function Sea() {
  return (
    <Frame shadow={false}>
      <rect x="8" y="14" width="104" height="96" rx="16" fill="#bfe6ff" />
      <circle cx="90" cy="38" r="12" fill="#ffd23f" />
      <g className={T('an-sway-s')}><path d="M8 60 q14 -10 28 0 t28 0 t28 0 t20 -4 V110 H8 Z" fill="#3d9be0" /></g>
      <g className={T('an-sway')}><path d="M8 78 q14 -10 28 0 t28 0 t28 0 t20 -4 V110 H8 Z" fill="#2a85cc" /></g>
      <path d="M8 96 q14 -9 28 0 t28 0 t28 0 t20 -4 V110 H8 Z" fill="#1f6fb2" />
      <g className={T('an-float')}><path d="M30 58 l16 0 l-4 10 h-8 z" fill="#fff" /><path d="M38 40 v18" stroke="#7a5a3a" strokeWidth="2.2" /><path d="M38 42 l10 12 h-10 z" fill="#ffe9b3" /></g>
    </Frame>
  );
}

export function Star() {
  return (
    <Frame>
      <g className={T('an-twinkle')}>
        <path d="M60 12 L72 44 L106 46 L80 67 L89 100 L60 82 L31 100 L40 67 L14 46 L48 44 Z" fill="#ffd23f" stroke="#f0b400" strokeWidth="3" strokeLinejoin="round" />
        <path d="M60 24 L68 46 L90 48 L74 62" fill="none" stroke="#fff4b0" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className={T('an-twinkle')} style={{ animationDelay: '0.7s' }}><path d="M100 18 v10 M95 23 h10" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
      <g className={T('an-twinkle')} style={{ animationDelay: '1.3s' }}><path d="M16 84 v8 M12 88 h8" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Moon() {
  return (
    <Frame shadow={false}>
      <rect x="8" y="10" width="104" height="100" rx="18" fill="#243a6b" />
      <g className={T('an-float')}><path d="M74 24 a38 38 0 1 0 14 66 a30 30 0 1 1 -14 -66 Z" fill="#ffe27a" /></g>
      <g className={T('an-twinkle')}><circle cx="94" cy="34" r="2.4" fill="#fff" /><circle cx="30" cy="30" r="2" fill="#fff" /></g>
      <g className={T('an-twinkle')} style={{ animationDelay: '1s' }}><circle cx="100" cy="76" r="2" fill="#fff" /><circle cx="22" cy="92" r="2.4" fill="#fff" /></g>
    </Frame>
  );
}

export function Tree() {
  return (
    <Frame>
      <path d="M54 110 Q56 80 52 64 H68 Q64 80 66 110 Z" fill="#8a5a2c" />
      <g className={T('an-o-b an-sway-s')}>
        <circle cx="60" cy="40" r="30" fill="#4ea85a" /><circle cx="36" cy="54" r="20" fill="#5bb866" /><circle cx="84" cy="54" r="20" fill="#5bb866" /><circle cx="60" cy="26" r="16" fill="#6cc977" />
        <circle cx="48" cy="46" r="3.2" fill="#e0533d" /><circle cx="72" cy="38" r="3.2" fill="#e0533d" /><circle cx="62" cy="58" r="3.2" fill="#e0533d" />
      </g>
    </Frame>
  );
}

export function Palm() {
  return (
    <Frame>
      <path d="M58 110 Q60 84 66 52 L72 54 Q68 86 70 110 Z" fill="#a8742f" />
      <path d="M62 66 h10 M61 80 h10 M60 94 h10" stroke="#8a5a22" strokeWidth="2" />
      <g className={T('an-o-bl an-sway-s')}>
        <path d="M68 50 Q40 30 18 46 Q44 38 68 54 Z" fill="#3d9a52" />
        <path d="M68 50 Q96 30 118 46 Q92 38 68 54 Z" fill="#3d9a52" />
        <path d="M68 50 Q50 20 30 16 Q56 24 68 54 Z" fill="#4fb064" />
        <path d="M68 50 Q86 20 106 16 Q80 24 68 54 Z" fill="#4fb064" />
        <path d="M68 50 Q68 22 68 8 Q76 26 70 54 Z" fill="#5cc171" />
        <circle cx="64" cy="58" r="4.6" fill="#8a5a22" /><circle cx="73" cy="58" r="4.6" fill="#a8742f" />
      </g>
    </Frame>
  );
}

export function Nest() {
  return (
    <Frame>
      <ellipse cx="60" cy="86" rx="40" ry="22" fill="#a8742f" />
      <path d="M22 80 Q60 104 98 80 Q98 98 60 106 Q22 98 22 80 Z" fill="#c78c3d" />
      <path d="M26 84 q12 -6 22 0 M52 90 q14 -6 26 0 M78 82 q10 -4 18 2 M34 94 q10 4 22 2 M62 98 q10 2 20 -2" stroke="#7a5420" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="46" cy="72" rx="11" ry="14" fill="#cfe9ff" /><ellipse cx="68" cy="70" rx="11" ry="14" fill="#bfe0fa" />
      <ellipse cx="43" cy="66" rx="3" ry="5" fill="#fff" opacity="0.8" /><ellipse cx="65" cy="64" rx="3" ry="5" fill="#fff" opacity="0.8" />
      <path d="M72 82 q10 -4 20 0" stroke="#7a5420" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Garden() {
  return (
    <Frame shadow={false}>
      <rect x="8" y="12" width="104" height="98" rx="16" fill="#cdeeff" />
      <circle cx="94" cy="32" r="11" fill="#ffd23f" />
      <path d="M8 84 Q40 62 70 80 T112 76 V110 H8 Z" fill="#8fd16a" />
      <path d="M8 98 Q50 86 112 100 V110 H8 Z" fill="#6cc24a" />
      <path d="M30 110 Q56 98 90 110" stroke="#5bb7f0" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="28" y="58" width="6" height="26" fill="#8a5a2c" />
      <g className={T('an-sway-s')}><circle cx="31" cy="48" r="18" fill="#4ea85a" /><circle cx="24" cy="42" r="3.4" fill="#ff8a3d" /><circle cx="38" cy="50" r="3.4" fill="#ff8a3d" /><circle cx="30" cy="56" r="3.4" fill="#ff8a3d" /></g>
      <g className={T('an-sway')}>
        <path d="M70 90 V76 M84 92 V80 M98 88 V76" stroke="#3d9a52" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="70" cy="74" r="5" fill="#ff6f91" /><circle cx="84" cy="78" r="5" fill="#ffd23f" /><circle cx="98" cy="74" r="5" fill="#b78bff" />
      </g>
    </Frame>
  );
}

export function Calendar() {
  return (
    <Frame>
      <rect x="20" y="20" width="80" height="88" rx="10" fill="#fff" stroke="#d8dde6" strokeWidth="2.4" />
      <path d="M20 30 a10 10 0 0 1 10 -10 h60 a10 10 0 0 1 10 10 v14 H20 Z" fill="#3d7bd9" />
      <rect x="36" y="12" width="6" height="16" rx="3" fill="#7a8aa5" /><rect x="78" y="12" width="6" height="16" rx="3" fill="#7a8aa5" />
      <g fill="#c9d3e3">{[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={30 + c * 16} y={54 + r * 13} width="9" height="8" rx="2" />))}</g>
      <g className={T('an-pulse')}><circle cx="62" cy="80" r="8" fill="#ffd23f" /><path d="M64 75 a6 6 0 1 0 0 10 a5 5 0 1 1 0 -10 Z" fill="#fff6c9" /></g>
    </Frame>
  );
}
