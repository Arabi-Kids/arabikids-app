import { Frame, Eye, Blush, INK } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;

export function Lion() {
  const tufts = [[94, 60], [86, 84], [60, 94], [34, 84], [26, 60], [34, 36], [60, 26], [86, 36]];
  return (
    <Frame>
      <g className={T('an-pulse')}>
        {tufts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="13" fill="#c9792a" />)}
        <circle cx="60" cy="60" r="35" fill="#b8691f" />
      </g>
      <circle cx="39" cy="38" r="8" fill="#f4c56b" />
      <circle cx="81" cy="38" r="8" fill="#f4c56b" />
      <circle cx="39" cy="38" r="4" fill="#e8a07c" />
      <circle cx="81" cy="38" r="4" fill="#e8a07c" />
      <circle cx="60" cy="63" r="25" fill="#f4c56b" />
      <ellipse cx="60" cy="73" rx="12" ry="9" fill="#fff1d0" />
      <path d="M53.5 66 H66.5 L60 73 Z" fill="#7a3b1d" />
      <path d="M60 73 V77 M60 77 Q55 81 50.5 77 M60 77 Q65 81 69.5 77" stroke="#7a3b1d" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Eye x={49} y={58} /><Eye x={71} y={58} delay={0.05} />
      <Blush x={42} y={69} /><Blush x={78} y={69} />
    </Frame>
  );
}

export function Rabbit() {
  return (
    <Frame>
      <g className={T('an-o-b an-sway-s')} style={{ animationDelay: '0.2s' }}>
        <ellipse cx="45" cy="30" rx="9" ry="24" fill="#d9c7ae" transform="rotate(-9 45 30)" />
        <ellipse cx="45" cy="31" rx="4.6" ry="17" fill="#f4a6b8" transform="rotate(-9 45 31)" />
      </g>
      <g className={T('an-o-b an-sway-s')}>
        <ellipse cx="75" cy="30" rx="9" ry="24" fill="#d9c7ae" transform="rotate(9 75 30)" />
        <ellipse cx="75" cy="31" rx="4.6" ry="17" fill="#f4a6b8" transform="rotate(9 75 31)" />
      </g>
      <ellipse cx="60" cy="74" rx="30" ry="26" fill="#d9c7ae" />
      <ellipse cx="60" cy="82" rx="16" ry="12" fill="#f6efe3" />
      <Eye x={48} y={68} r={3.8} /><Eye x={72} y={68} r={3.8} delay={0.05} />
      <g className={T('an-twitch')}><ellipse cx="60" cy="77" rx="3.4" ry="2.6" fill="#e58aa0" /></g>
      <path d="M60 79.5 V83 M60 83 Q55 87 51 84 M60 83 Q65 87 69 84" stroke="#9a6b66" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="57" y="85" width="6" height="6" rx="1.5" fill="#fff" stroke="#e5ddd0" strokeWidth="0.8" />
      <Blush x={40} y={78} /><Blush x={80} y={78} />
    </Frame>
  );
}

export function Camel() {
  return (
    <Frame>
      <path className={T('an-o-t an-wag')} d="M95 76 Q108 82 103 98" stroke="#b88646" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {[78, 90].map((x) => <rect key={x} x={x - 4} y="88" width="8" height="22" rx="3" fill="#c99a52" />)}
      <circle cx="62" cy="58" r="15" fill="#dcaa5e" />
      <ellipse cx="64" cy="80" rx="32" ry="18" fill="#dcaa5e" />
      {[46, 58].map((x) => <rect key={x} x={x - 4} y="88" width="8" height="22" rx="3" fill="#dcaa5e" />)}
      {[46, 58, 78, 90].map((x) => <rect key={`h${x}`} x={x - 4} y="106" width="8" height="4" rx="2" fill="#7b5a2e" />)}
      <g className={T('an-o-b an-sway-s')}>
        <path d="M44 78 Q28 62 31 40 L45 38 Q48 60 58 72 Z" fill="#dcaa5e" />
        <ellipse cx="33" cy="34" rx="14" ry="10.5" fill="#dcaa5e" transform="rotate(-12 33 34)" />
        <ellipse cx="22" cy="40" rx="9.5" ry="7" fill="#f1d29c" transform="rotate(-12 22 40)" />
        <ellipse cx="43" cy="24" rx="3.4" ry="6.5" fill="#c99a52" transform="rotate(18 43 24)" />
        <circle cx="19" cy="38" r="1.3" fill="#7b5a2e" />
        <path d="M15 43 Q22 47 28 43" stroke="#7b5a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <Eye x={33} y={30} r={3.2} />
        <Blush x={37} y={39} rx={4} ry={2.4} />
      </g>
    </Frame>
  );
}

export function Horse() {
  return (
    <Frame>
      <path className={T('an-o-tl an-sway')} d="M94 68 Q114 74 108 102 Q101 88 93 84 Z" fill="#2e1d12" />
      {[80, 90].map((x) => <rect key={x} x={x - 4} y="88" width="8" height="22" rx="3" fill="#7e4b2b" />)}
      <ellipse cx="66" cy="78" rx="30" ry="18" fill="#9a5f37" />
      {[46, 56].map((x) => <rect key={x} x={x - 4} y="88" width="8" height="22" rx="3" fill="#9a5f37" />)}
      {[46, 56, 80, 90].map((x) => <rect key={`h${x}`} x={x - 4} y="105" width="8" height="5" rx="2" fill="#2e1d12" />)}
      <g className={T('an-o-b an-sway-s')}>
        <path d="M44 76 Q32 54 38 32 L56 28 Q56 54 66 68 Z" fill="#9a5f37" />
        <path d="M54 28 Q66 46 68 66" stroke="#2e1d12" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M40 32 L42 14 L50 28 Z" fill="#9a5f37" />
        <path d="M43 28 L44 19 L47 28 Z" fill="#d79b78" />
        <ellipse cx="33" cy="38" rx="17" ry="10" fill="#9a5f37" transform="rotate(38 33 38)" />
        <ellipse cx="23" cy="49" rx="9" ry="6.5" fill="#c9926a" transform="rotate(38 23 49)" />
        <path d="M38 24 Q30 36 24 46" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.9" />
        <circle cx="19.5" cy="50" r="1.4" fill="#5a3320" />
        <Eye x={36} y={35} r={3.2} />
      </g>
    </Frame>
  );
}

export function Sheep() {
  const wool = [[34, 52], [86, 52], [30, 74], [90, 74], [42, 38], [78, 38], [60, 32], [44, 92], [76, 92], [60, 96]];
  return (
    <Frame>
      <g className={T('an-pulse')}>
        {wool.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="17" fill="#f7f4ee" />)}
        <circle cx="60" cy="62" r="32" fill="#f7f4ee" />
        <circle cx="38" cy="86" r="9" fill="#e6e1d6" opacity="0.7" />
        <circle cx="82" cy="86" r="9" fill="#e6e1d6" opacity="0.7" />
      </g>
      <g className={T('an-o-r an-sway-s')}><ellipse cx="35" cy="66" rx="11" ry="6" fill="#4f4a58" transform="rotate(25 35 66)" /></g>
      <g className={T('an-o-l an-sway-s')} style={{ animationDelay: '0.3s' }}><ellipse cx="85" cy="66" rx="11" ry="6" fill="#4f4a58" transform="rotate(-25 85 66)" /></g>
      <ellipse cx="60" cy="68" rx="17" ry="21" fill="#5b5566" />
      <circle cx="52" cy="46" r="9" fill="#f7f4ee" /><circle cx="64" cy="45" r="9" fill="#f7f4ee" /><circle cx="58" cy="41" r="8" fill="#f7f4ee" />
      <Eye x={52} y={64} r={3.2} /><Eye x={68} y={64} r={3.2} delay={0.05} />
      <ellipse cx="60" cy="77" rx="5" ry="3.4" fill="#e9a7b5" />
      <path d="M60 80 Q56 85 52 82 M60 80 Q64 85 68 82" stroke="#e9d9d3" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Giraffe() {
  const spots = [[54, 96, 5], [68, 86, 4.5], [52, 76, 4], [66, 66, 4.5], [54, 56, 4]];
  return (
    <Frame>
      <ellipse cx="60" cy="108" rx="26" ry="8" fill="#e9aa38" />
      <g className={T('an-o-b an-sway-s')}>
        <path d="M46 108 Q50 70 50 52 L72 52 Q70 70 74 108 Z" fill="#f2b84a" />
        {spots.map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.8} fill="#b9702b" />)}
        <path d="M66 52 Q74 70 72 100" stroke="#a96520" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
        <rect x="52" y="14" width="3" height="14" rx="1.5" fill="#c98a3d" /><circle cx="53.5" cy="13" r="3.4" fill="#7a4a20" />
        <rect x="65" y="14" width="3" height="14" rx="1.5" fill="#c98a3d" /><circle cx="66.5" cy="13" r="3.4" fill="#7a4a20" />
        <ellipse cx="44" cy="30" rx="8" ry="4.6" fill="#f2b84a" transform="rotate(-25 44 30)" />
        <ellipse cx="76" cy="30" rx="8" ry="4.6" fill="#f2b84a" transform="rotate(25 76 30)" />
        <ellipse cx="60" cy="38" rx="16" ry="14" fill="#f2b84a" />
        <ellipse cx="60" cy="47" rx="11" ry="8" fill="#f9dc92" />
        <circle cx="56" cy="47" r="1.4" fill="#7a4a20" /><circle cx="64" cy="47" r="1.4" fill="#7a4a20" />
        <path d="M56 52 Q60 55 64 52" stroke="#7a4a20" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="56" cy="34" r="2.6" fill="#b9702b" opacity="0.8" /><circle cx="68" cy="30" r="2.2" fill="#b9702b" opacity="0.8" />
        <Eye x={52} y={37} r={3.2} /><Eye x={68} y={37} r={3.2} delay={0.05} />
      </g>
    </Frame>
  );
}

export function Fox() {
  return (
    <Frame>
      <g className={T('an-o-b an-twitch')}>
        <path d="M26 56 L22 22 L48 40 Z" fill="#e8772e" /><path d="M29 50 L27 31 L42 41 Z" fill="#3b2418" />
      </g>
      <g className={T('an-o-b an-twitch')} style={{ animationDelay: '0.6s' }}>
        <path d="M94 56 L98 22 L72 40 Z" fill="#e8772e" /><path d="M91 50 L93 31 L78 41 Z" fill="#3b2418" />
      </g>
      <path d="M60 100 L20 64 Q16 52 26 44 Q60 36 94 44 Q104 52 100 64 Z" fill="#e8772e" />
      <path d="M60 100 L28 70 Q44 70 60 76 Q76 70 92 70 Z" fill="#fff8ee" />
      <path d="M52 58 Q60 66 68 58 L60 76 Z" fill="#fff8ee" />
      <ellipse cx="60" cy="90" rx="5" ry="4" fill={INK} />
      <Eye x={44} y={62} r={3.6} /><Eye x={76} y={62} r={3.6} delay={0.05} />
      <path d="M60 94 V98 M60 98 Q55 102 51 99 M60 98 Q65 102 69 99" stroke="#3b2418" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M30 52 Q36 50 40 54 M90 52 Q84 50 80 54" stroke="#c45a1c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Deer() {
  return (
    <Frame>
      <g className={T('an-o-b an-sway-s')}>
        <path d="M46 40 L40 16 M40 16 L33 8 M40 16 L45 8 M43 28 L34 24" stroke="#cfa56a" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <path d="M74 40 L80 16 M80 16 L87 8 M80 16 L75 8 M77 28 L86 24" stroke="#cfa56a" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      </g>
      <g className={T('an-o-r an-twitch')}><ellipse cx="34" cy="48" rx="11" ry="6" fill="#a8683b" transform="rotate(-28 34 48)" /><ellipse cx="34" cy="48" rx="6" ry="3" fill="#e8b7a0" transform="rotate(-28 34 48)" /></g>
      <g className={T('an-o-l an-twitch')} style={{ animationDelay: '0.7s' }}><ellipse cx="86" cy="48" rx="11" ry="6" fill="#a8683b" transform="rotate(28 86 48)" /><ellipse cx="86" cy="48" rx="6" ry="3" fill="#e8b7a0" transform="rotate(28 86 48)" /></g>
      <path d="M60 104 Q36 96 36 62 Q36 40 60 40 Q84 40 84 62 Q84 96 60 104 Z" fill="#a8683b" />
      <ellipse cx="60" cy="84" rx="13" ry="14" fill="#f1d9b8" />
      <ellipse cx="60" cy="76" rx="6" ry="4.4" fill="#3b2418" />
      <path d="M60 80 V86 M60 86 Q55 90 51 87 M60 86 Q65 90 69 87" stroke="#5a3320" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="50" r="1.8" fill="#f1d9b8" /><circle cx="68" cy="50" r="1.8" fill="#f1d9b8" /><circle cx="60" cy="47" r="1.8" fill="#f1d9b8" />
      <Eye x={49} y={62} r={3.6} /><Eye x={71} y={62} r={3.6} delay={0.05} />
      <Blush x={42} y={76} rx={4} ry={2.6} /><Blush x={78} y={76} rx={4} ry={2.6} />
    </Frame>
  );
}

export function Gazelle() {
  return (
    <Frame>
      <g className={T('an-o-b an-sway-s')}>
        <path d="M46 44 Q36 26 40 8 M44 38 L47 33 M42 30 L45 25 M41 22 L44 17" stroke="#3b2f28" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <path d="M74 44 Q84 26 80 8 M76 38 L73 33 M78 30 L75 25 M79 22 L76 17" stroke="#3b2f28" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      </g>
      <g className={T('an-o-r an-twitch')}><ellipse cx="33" cy="54" rx="12" ry="5.4" fill="#d9a066" transform="rotate(-18 33 54)" /><ellipse cx="33" cy="54" rx="6.5" ry="2.8" fill="#f2d8c4" transform="rotate(-18 33 54)" /></g>
      <g className={T('an-o-l an-twitch')} style={{ animationDelay: '0.6s' }}><ellipse cx="87" cy="54" rx="12" ry="5.4" fill="#d9a066" transform="rotate(18 87 54)" /><ellipse cx="87" cy="54" rx="6.5" ry="2.8" fill="#f2d8c4" transform="rotate(18 87 54)" /></g>
      <path d="M60 108 Q42 100 42 70 Q42 46 60 44 Q78 46 78 70 Q78 100 60 108 Z" fill="#d9a066" />
      <path d="M60 46 Q52 58 54 80 Q60 92 66 80 Q68 58 60 46 Z" fill="#fff4e4" />
      <path d="M44 62 Q50 66 54 76 M76 62 Q70 66 66 76" stroke="#3b2f28" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="96" rx="5.5" ry="4" fill="#3b2f28" />
      <path d="M60 99 Q56 103 52 101 M60 99 Q64 103 68 101" stroke="#3b2f28" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Eye x={47} y={64} r={3.4} /><Eye x={73} y={64} r={3.4} delay={0.05} />
    </Frame>
  );
}

export function Elephant() {
  return (
    <Frame>
      <g className={T('an-o-r an-flap-s')}><ellipse cx="28" cy="58" rx="20" ry="26" fill="#8ea0b6" /><ellipse cx="30" cy="58" rx="12" ry="18" fill="#d9a6b0" /></g>
      <g className={T('an-o-l an-flap-s')} style={{ animationDelay: '0.5s' }}><ellipse cx="92" cy="58" rx="20" ry="26" fill="#8ea0b6" /><ellipse cx="90" cy="58" rx="12" ry="18" fill="#d9a6b0" /></g>
      <circle cx="60" cy="54" r="29" fill="#9db0c6" />
      <g className={T('an-o-t an-sway-s')}>
        <path d="M50 68 Q48 92 56 102 Q60 108 66 104 Q60 100 61 90 Q64 80 70 68 Z" fill="#9db0c6" />
        <path d="M52 80 H62 M52 88 H61" stroke="#8394ab" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <path d="M46 72 Q40 82 44 92 Q48 84 52 78 Z" fill="#fffaf0" /><path d="M74 72 Q80 82 76 92 Q72 84 68 78 Z" fill="#fffaf0" />
      <Eye x={48} y={50} r={3.4} /><Eye x={72} y={50} r={3.4} delay={0.05} />
      <path d="M44 41 Q48 38 53 41 M67 41 Q72 38 76 41" stroke="#7d8fa6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Blush x={42} y={62} rx={4.5} ry={2.8} /><Blush x={78} y={62} rx={4.5} ry={2.8} />
    </Frame>
  );
}

export function Monkey() {
  return (
    <Frame>
      <g className={T('an-sway-s')}><circle cx="26" cy="56" r="13" fill="#8a5a3a" /><circle cx="26" cy="56" r="7" fill="#e8c29a" /></g>
      <g className={T('an-sway-s')} style={{ animationDelay: '0.5s' }}><circle cx="94" cy="56" r="13" fill="#8a5a3a" /><circle cx="94" cy="56" r="7" fill="#e8c29a" /></g>
      <ellipse cx="60" cy="58" rx="33" ry="35" fill="#8a5a3a" />
      <path d="M60 52 Q44 40 38 52 Q34 66 44 74 Q50 88 60 88 Q70 88 76 74 Q86 66 82 52 Q76 40 60 52 Z" fill="#f0cfa6" />
      <Eye x={50} y={60} r={3.6} /><Eye x={70} y={60} r={3.6} delay={0.05} />
      <ellipse cx="60" cy="72" rx="9" ry="6" fill="#e3b88c" />
      <circle cx="57" cy="71" r="1.3" fill="#5a3320" /><circle cx="63" cy="71" r="1.3" fill="#5a3320" />
      <path d="M50 78 Q60 88 70 78" stroke="#5a3320" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Blush x={43} y={72} /><Blush x={77} y={72} />
      <path d="M46 28 Q60 20 74 28" stroke="#6e4528" strokeWidth="5" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Dog() {
  return (
    <Frame>
      <g className={T('an-o-tr an-sway-s')}><path d="M36 38 Q14 42 18 76 Q22 88 34 80 Q38 62 40 46 Z" fill="#6e4528" /></g>
      <g className={T('an-o-tl an-sway-s')} style={{ animationDelay: '0.4s' }}><path d="M84 38 Q106 42 102 76 Q98 88 86 80 Q82 62 80 46 Z" fill="#6e4528" /></g>
      <ellipse cx="60" cy="62" rx="30" ry="30" fill="#d9a066" />
      <path d="M60 36 Q48 42 48 56 Q60 50 72 56 Q72 42 60 36 Z" fill="#c68a4d" />
      <ellipse cx="60" cy="76" rx="16" ry="13" fill="#f6e3c8" />
      <ellipse cx="60" cy="69" rx="6.2" ry="4.6" fill={INK} />
      <ellipse cx="58.4" cy="67.6" rx="1.8" ry="1.1" fill="#fff" opacity="0.8" />
      <path d="M60 73 V78 M60 78 Q54 82 50 78 M60 78 Q66 82 70 78" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <g className={T('an-o-t an-pant')}><path d="M55 81 Q60 94 65 81 Z" fill="#f0728f" /><path d="M60 82 V88" stroke="#d04f72" strokeWidth="1.2" /></g>
      <Eye x={47} y={56} r={3.8} /><Eye x={73} y={56} r={3.8} delay={0.05} />
      <path d="M41 49 Q46 46 51 49 M69 49 Q74 46 79 49" stroke="#8a5a2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Blush x={40} y={70} /><Blush x={80} y={70} />
    </Frame>
  );
}
