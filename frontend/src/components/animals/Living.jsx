import { Frame, Eye, Blush, INK } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;
const SKIN = '#f2c9a0';

export function Grapes() {
  const balls = [[44, 48], [60, 48], [76, 48], [52, 64], [68, 64], [44, 80], [60, 80], [76, 80], [60, 96]];
  return (
    <Frame>
      <path d="M60 38 Q58 22 66 14" stroke="#7a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M62 24 Q80 8 96 20 Q80 32 62 24 Z" fill="#4ea85a" />
      <g className={T('an-sway-s')}>
        {balls.map(([x, y]) => <circle key={`${x}${y}`} cx={x - 2} cy={y} r="11" fill="#7d4fc9" />)}
        {balls.map(([x, y]) => <circle key={`h${x}${y}`} cx={x - 5} cy={y - 4} r="3" fill="#b79af0" />)}
      </g>
    </Frame>
  );
}

export function Apple() {
  return (
    <Frame>
      <path d="M60 36 Q30 24 20 54 Q16 90 46 106 Q60 112 74 106 Q104 90 100 54 Q90 24 60 36 Z" fill="#e0453a" />
      <path d="M60 36 Q40 30 30 48" stroke="#ff8a7a" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M60 36 Q58 22 66 12" stroke="#7a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g className={T('an-o-bl an-sway-s')}><path d="M64 24 Q82 8 98 20 Q82 34 64 24 Z" fill="#4ea85a" /></g>
    </Frame>
  );
}

export function Watermelon() {
  return (
    <Frame>
      <path d="M8 44 H112 A52 52 0 0 1 8 44 Z" fill="#3d9a52" />
      <path d="M14 44 H106 A46 46 0 0 1 14 44 Z" fill="#e8f3c9" />
      <path d="M20 44 H100 A40 40 0 0 1 20 44 Z" fill="#e8453a" />
      <g fill={INK}>{[[40, 56], [60, 62], [80, 56], [50, 74], [70, 74]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2.6" ry="4" transform={`rotate(${x > 60 ? -20 : 20} ${x} ${y})`} />)}</g>
      <path d="M30 44 H90" stroke="#ff8a7a" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </Frame>
  );
}

export function Egg() {
  return (
    <Frame>
      <path d="M60 14 C86 14 98 52 98 74 C98 96 82 108 60 108 C38 108 22 96 22 74 C22 52 34 14 60 14 Z" fill="#fff8ec" stroke="#eadfc8" strokeWidth="3" />
      <path d="M40 40 Q46 26 56 24" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g className={T('an-twinkle')}><path d="M96 30 v10 M91 35 h10" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Ear() {
  return (
    <Frame>
      <path d="M62 14 C94 12 106 40 98 64 C92 82 78 86 76 100 C74 112 58 114 54 102 C50 92 62 84 56 74 C40 70 28 52 36 32 C42 18 52 14 62 14 Z" fill={SKIN} stroke="#e0a876" strokeWidth="3" />
      <path d="M62 30 C80 28 86 46 80 60 C76 70 68 70 66 80" stroke="#e0a876" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M52 44 C56 38 62 40 62 46 C62 52 56 56 54 62" stroke="#e0a876" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g className={T('an-pulse')}><path d="M12 50 q-6 10 0 20 M6 44 q-10 16 0 32" stroke="#7fb9ea" strokeWidth="3.4" fill="none" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function EyeArt() {
  return (
    <Frame>
      <path d="M8 62 Q60 8 112 62 Q60 116 8 62 Z" fill="#fff" stroke="#c9d3e3" strokeWidth="3" />
      <circle cx="60" cy="62" r="24" fill="#6b4a2b" /><circle cx="60" cy="62" r="16" fill="#3a2a1b" />
      <circle cx="68" cy="54" r="6" fill="#fff" /><circle cx="52" cy="70" r="3" fill="#fff" opacity="0.7" />
      <g className={T('an-blink')}><path d="M8 62 Q60 8 112 62" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" /></g>
      <path d="M30 36 l-6 -10 M48 26 l-2 -12 M72 26 l2 -12 M90 36 l6 -10" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    </Frame>
  );
}

export function Finger() {
  return (
    <Frame>
      <rect x="52" y="14" width="18" height="52" rx="9" fill={SKIN} stroke="#e0a876" strokeWidth="2.6" />
      <path d="M52 66 Q30 66 30 86 Q30 108 54 108 H80 Q98 108 98 88 V74 Q98 62 86 62 Q80 54 70 60 V66 Z" fill={SKIN} stroke="#e0a876" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M70 66 V80 M80 66 V80" stroke="#e0a876" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M56 18 q4 -4 8 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <g className={T('an-twinkle')}><path d="M92 18 l-6 8 M100 30 l-8 4 M86 10 l-2 8" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" /></g>
    </Frame>
  );
}

export function Hair() {
  return (
    <Frame>
      <path d="M26 66 Q18 18 60 16 Q102 18 94 66 Q96 96 86 108 Q80 80 74 52 Q60 62 46 52 Q40 80 34 108 Q24 96 26 66 Z" fill="#5a3a22" />
      <circle cx="60" cy="68" r="28" fill={SKIN} />
      <path d="M32 58 Q60 24 88 58 Q70 44 60 44 Q48 44 32 58 Z" fill="#5a3a22" />
      <Eye x={50} y={70} r={3.2} /><Eye x={70} y={70} r={3.2} delay={0.05} />
      <path d="M54 82 Q60 88 66 82" stroke="#c0594b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Blush x={44} y={80} rx={4} ry={2.4} /><Blush x={76} y={80} rx={4} ry={2.4} />
    </Frame>
  );
}

export function Face() {
  return (
    <Frame>
      <circle cx="60" cy="62" r="42" fill={SKIN} stroke="#e0a876" strokeWidth="3" />
      <path d="M26 52 Q60 20 94 52 Q76 40 60 40 Q44 40 26 52 Z" fill="#4a3220" />
      <Eye x={44} y={62} r={4.4} /><Eye x={76} y={62} r={4.4} delay={0.05} />
      <path d="M52 82 Q60 92 68 82" stroke="#c0594b" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <Blush x={36} y={76} rx={6} ry={3.6} /><Blush x={84} y={76} rx={6} ry={3.6} />
      <path d="M60 66 q-3 6 1 8" stroke="#e0a876" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Boy() {
  return (
    <Frame>
      <rect x="40" y="62" width="40" height="40" rx="12" fill="#3d7bd9" />
      <rect x="44" y="96" width="14" height="14" rx="5" fill="#2f4a7a" /><rect x="62" y="96" width="14" height="14" rx="5" fill="#2f4a7a" />
      <g className={T('an-o-t an-sway')}><rect x="26" y="66" width="14" height="26" rx="7" fill={SKIN} transform="rotate(14 33 66)" /></g>
      <rect x="80" y="66" width="14" height="26" rx="7" fill={SKIN} transform="rotate(-14 87 66)" />
      <circle cx="60" cy="42" r="24" fill={SKIN} />
      <path d="M36 40 Q38 18 60 18 Q82 18 84 40 Q72 28 60 28 Q48 28 36 40 Z" fill="#3b2a1c" />
      <Eye x={51} y={44} r={3.2} /><Eye x={69} y={44} r={3.2} delay={0.05} />
      <path d="M54 54 Q60 60 66 54" stroke="#c0594b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Blush x={45} y={53} rx={4} ry={2.4} /><Blush x={75} y={53} rx={4} ry={2.4} />
    </Frame>
  );
}

export function Teacher() {
  return (
    <Frame>
      <rect x="10" y="16" width="58" height="42" rx="4" fill="#2f6b4a" stroke="#8a5a2c" strokeWidth="4" />
      <path d="M18 30 h26 M18 40 h36 M18 50 h18" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <rect x="70" y="62" width="38" height="44" rx="12" fill="#6b4ea8" />
      <g className={T('an-o-t an-sway')}><rect x="52" y="64" width="12" height="28" rx="6" fill={SKIN} transform="rotate(30 58 64)" /><path d="M50 80 L26 54" stroke="#caa43a" strokeWidth="3.4" strokeLinecap="round" /></g>
      <circle cx="89" cy="46" r="20" fill={SKIN} />
      <path d="M69 44 Q72 24 89 24 Q106 24 109 44 Q98 34 89 34 Q80 34 69 44 Z" fill="#3b2a1c" />
      <g fill="none" stroke="#1c1a17" strokeWidth="2.2"><circle cx="82" cy="48" r="6" /><circle cx="97" cy="48" r="6" /><path d="M88 48 h3" /></g>
      <Eye x={82} y={48} r={2.2} /><Eye x={97} y={48} r={2.2} delay={0.05} />
      <path d="M84 58 Q89 63 94 58" stroke="#c0594b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function Cow() {
  return (
    <Frame>
      <g className={T('an-o-t an-sway-s')}><path d="M96 76 Q110 84 106 104" stroke="#f4f4f4" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="106" cy="106" r="4" fill="#3a2e2a" /></g>
      <rect x="34" y="92" width="10" height="16" rx="3" fill="#f6f6f6" /><rect x="76" y="92" width="10" height="16" rx="3" fill="#f6f6f6" />
      <rect x="34" y="102" width="10" height="7" rx="2" fill="#3a2e2a" /><rect x="76" y="102" width="10" height="7" rx="2" fill="#3a2e2a" />
      <ellipse cx="66" cy="80" rx="38" ry="22" fill="#f6f6f6" />
      <path d="M52 66 Q66 60 74 70 Q70 84 56 82 Z" fill="#3a2e2a" /><path d="M84 78 Q98 76 100 88 Q90 96 82 90 Z" fill="#3a2e2a" />
      <path d="M22 38 q-8 -8 -4 -16 q8 2 10 14 Z M58 38 q8 -8 4 -16 q-8 2 -10 14 Z" fill="#f2d8a0" />
      <ellipse cx="38" cy="58" rx="26" ry="24" fill="#f6f6f6" />
      <path d="M20 44 Q28 30 40 40 Q30 56 20 52 Z" fill="#3a2e2a" />
      <ellipse cx="38" cy="70" rx="17" ry="12" fill="#ffb6c1" />
      <ellipse cx="32" cy="70" rx="2.6" ry="3.4" fill="#d86a86" /><ellipse cx="44" cy="70" rx="2.6" ry="3.4" fill="#d86a86" />
      <Eye x={28} y={52} r={3.2} /><Eye x={48} y={52} r={3.2} delay={0.05} />
    </Frame>
  );
}

export function Cat() {
  return (
    <Frame>
      <g className={T('an-o-l an-wag')}><path d="M84 96 Q112 94 108 66" stroke="#f0912f" strokeWidth="8" fill="none" strokeLinecap="round" /></g>
      <ellipse cx="60" cy="90" rx="30" ry="22" fill="#f6a443" />
      <ellipse cx="60" cy="98" rx="14" ry="10" fill="#ffe0b0" />
      <rect x="40" y="100" width="14" height="10" rx="5" fill="#f6a443" /><rect x="66" y="100" width="14" height="10" rx="5" fill="#f6a443" />
      <path d="M34 44 L38 18 L56 34 Z" fill="#f6a443" /><path d="M86 44 L82 18 L64 34 Z" fill="#f6a443" />
      <path d="M39 38 L41 26 L50 34 Z" fill="#ffb6a8" /><path d="M81 38 L79 26 L70 34 Z" fill="#ffb6a8" />
      <ellipse cx="60" cy="54" rx="28" ry="24" fill="#f6a443" />
      <path d="M52 34 v8 M60 32 v9 M68 34 v8" stroke="#d9801c" strokeWidth="2.6" strokeLinecap="round" />
      <Eye x={48} y={52} r={3.6} /><Eye x={72} y={52} r={3.6} delay={0.05} />
      <path d="M57 60 L63 60 L60 64 Z" fill="#e0707f" /><path d="M60 64 Q56 69 52 66 M60 64 Q64 69 68 66" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 62 h-12 M40 66 l-11 4 M80 62 h12 M80 66 l11 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </Frame>
  );
}

export function Mule() {
  return (
    <Frame>
      <g className={T('an-o-b an-twitch')}><path d="M40 40 Q30 8 44 8 Q56 16 54 40 Z" fill="#8c8379" /><path d="M43 34 Q38 14 45 14 Q50 20 50 34 Z" fill="#e9b6b0" /></g>
      <g className={T('an-o-b an-twitch')} style={{ animationDelay: '0.5s' }}><path d="M80 40 Q90 8 76 8 Q64 16 66 40 Z" fill="#8c8379" /><path d="M77 34 Q82 14 75 14 Q70 20 70 34 Z" fill="#e9b6b0" /></g>
      <path d="M36 44 Q60 30 84 44 Q96 66 90 92 Q82 112 60 112 Q38 112 30 92 Q24 66 36 44 Z" fill="#a39a8e" />
      <path d="M52 34 Q60 26 68 34 Q60 40 52 34 Z" fill="#5a5148" />
      <ellipse cx="60" cy="90" rx="26" ry="20" fill="#e9dfcf" />
      <ellipse cx="50" cy="90" rx="3" ry="5" fill="#7a6a58" /><ellipse cx="70" cy="90" rx="3" ry="5" fill="#7a6a58" />
      <path d="M52 100 Q60 106 68 100" stroke="#7a6a58" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Eye x={46} y={62} r={3.8} /><Eye x={74} y={62} r={3.8} delay={0.05} />
    </Frame>
  );
}

export function Ant() {
  return (
    <Frame>
      <g stroke="#2a2420" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M46 70 Q40 88 32 100 M58 72 Q58 92 56 106 M70 72 Q78 90 86 102" />
        <path d="M46 62 Q38 50 30 46 M58 60 Q60 44 62 36 M70 62 Q80 50 90 48" />
      </g>
      <ellipse cx="90" cy="64" rx="22" ry="17" fill="#3a302a" />
      <ellipse cx="58" cy="66" rx="14" ry="11" fill="#2a2420" />
      <circle cx="28" cy="58" r="14" fill="#2a2420" />
      <g className={T('an-o-b an-twitch')}><path d="M22 48 Q16 34 8 30 M34 48 Q38 32 46 28" stroke="#2a2420" strokeWidth="2.6" fill="none" strokeLinecap="round" /></g>
      <circle cx="23" cy="56" r="3.6" fill="#fff" /><circle cx="33" cy="56" r="3.6" fill="#fff" />
      <circle cx="23" cy="56" r="1.8" fill={INK} /><circle cx="33" cy="56" r="1.8" fill={INK} />
      <path d="M23 66 Q28 70 33 66" stroke="#e8756a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="86" cy="58" rx="8" ry="4" fill="#5a4a40" opacity="0.7" />
    </Frame>
  );
}
