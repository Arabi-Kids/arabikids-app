import { Frame, Eye, Blush, INK } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;

export function Crocodile() {
  return (
    <Frame>
      <g className={T('an-o-l an-wag')}><path d="M84 74 Q112 72 114 50 Q98 66 80 64 Z" fill="#4fa855" /></g>
      <rect x="44" y="86" width="11" height="14" rx="4" fill="#4aa352" /><rect x="82" y="86" width="11" height="14" rx="4" fill="#4aa352" />
      <path d="M44 100 h11 M82 100 h11" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="66" cy="76" rx="34" ry="17" fill="#55b85f" />
      <ellipse cx="62" cy="86" rx="25" ry="7" fill="#b6e6a0" />
      <g fill="#3f9a4b">{[48, 58, 68, 78, 88].map((x) => <path key={x} d={`M${x - 4} 62 L${x} 53 L${x + 4} 62 Z`} />)}</g>
      <rect x="44" y="86" width="11" height="14" rx="4" fill="#55b85f" /><rect x="82" y="86" width="11" height="14" rx="4" fill="#55b85f" />
      <path d="M38 62 L10 66 Q4 70 9 75 L40 77 Z" fill="#55b85f" />
      <path d="M40 77 L11 76 Q8 83 15 85 L42 86 Z" fill="#4aa352" />
      <path d="M9 76 L42 78" stroke="#2f6b34" strokeWidth="2.4" strokeLinecap="round" />
      <g fill="#fff">
        {[15, 22, 29, 36].map((x) => <path key={`u${x}`} d={`M${x - 2.4} 76.4 L${x + 2.4} 76.8 L${x} 82 Z`} />)}
        {[18.5, 25.5, 32.5].map((x) => <path key={`l${x}`} d={`M${x - 2.4} 77 L${x + 2.4} 77.2 L${x} 72.2 Z`} />)}
      </g>
      <circle cx="12" cy="68" r="1.6" fill="#2f6b34" />
      <circle cx="42" cy="60" r="10" fill="#55b85f" />
      <circle cx="42" cy="58" r="6.6" fill="#fff" />
      <Eye x={42} y={58} r={3.8} />
      <path d="M40 78 Q46 77 48 72" stroke="#2f6b34" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Blush x={50} y={74} rx={4} ry={2.4} />
    </Frame>
  );
}

export function Frog() {
  return (
    <Frame>
      <ellipse cx="32" cy="104" rx="14" ry="6" fill="#5aaf3a" /><ellipse cx="88" cy="104" rx="14" ry="6" fill="#5aaf3a" />
      <ellipse cx="60" cy="78" rx="34" ry="28" fill="#6cc24a" />
      <ellipse cx="60" cy="88" rx="21" ry="16" fill="#c9eb9a" />
      <circle cx="38" cy="48" r="14" fill="#6cc24a" /><circle cx="82" cy="48" r="14" fill="#6cc24a" />
      <circle cx="38" cy="47" r="10" fill="#fff" /><circle cx="82" cy="47" r="10" fill="#fff" />
      <Eye x={38} y={48} r={5.4} /><Eye x={82} y={48} r={5.4} delay={0.05} />
      <circle cx="54" cy="67" r="1.4" fill="#2f6f26" /><circle cx="66" cy="67" r="1.4" fill="#2f6f26" />
      <path d="M33 76 Q60 98 87 76" stroke="#2f6f26" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <g className={T('an-o-t an-pant')}><ellipse cx="60" cy="90" rx="10" ry="6" fill="#a8dc78" /></g>
      <Blush x={30} y={72} rx={6} ry={3.4} /><Blush x={90} y={72} rx={6} ry={3.4} />
    </Frame>
  );
}

export function Fish() {
  return (
    <Frame bob={false}>
      <g className={T('an-float')}>
        <g className={T('an-o-l an-wag')}><path d="M84 60 L112 38 Q105 60 112 82 Z" fill="#ff7a2f" /></g>
        <path d="M42 40 Q60 20 80 42 Z" fill="#ff7a2f" />
        <g className={T('an-o-tl an-sway')}><path d="M52 78 Q62 98 76 80 Z" fill="#ff7a2f" /></g>
        <ellipse cx="54" cy="60" rx="35" ry="24" fill="#ffa23a" />
        <path d="M48 38 Q56 60 48 82 M64 38 Q72 60 64 82 M78 42 Q84 60 78 78" stroke="#fff" strokeWidth="5.5" fill="none" strokeLinecap="round" opacity="0.88" />
        <path d="M36 46 Q43 60 36 74" stroke="#e8801f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="54" r="6.2" fill="#fff" />
        <Eye x={28} y={54} r={4} />
        <path d="M20 66 Q25 71 31 68" stroke="#b8611f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Blush x={36} y={64} rx={4} ry={2.6} />
      </g>
      <g fill="#cfeeff" stroke="#7ec8f0" strokeWidth="1.4">
        <circle className="an-part an-rise" cx="12" cy="44" r="3.6" />
        <circle className="an-part an-rise" cx="6" cy="34" r="2.6" style={{ animationDelay: '1s' }} />
        <circle className="an-part an-rise" cx="14" cy="26" r="3" style={{ animationDelay: '2s' }} />
      </g>
    </Frame>
  );
}

export function Bee() {
  return (
    <Frame bob={false}>
      <g className={T('an-float')}>
        <g className={T('an-o-br an-buzz')}><ellipse cx="46" cy="38" rx="14" ry="9" fill="#cfe9ff" stroke="#9fd0f5" strokeWidth="1.6" opacity="0.9" transform="rotate(-28 46 38)" /></g>
        <g className={T('an-o-bl an-buzz')} style={{ animationDirection: 'reverse' }}><ellipse cx="74" cy="38" rx="14" ry="9" fill="#cfe9ff" stroke="#9fd0f5" strokeWidth="1.6" opacity="0.9" transform="rotate(28 74 38)" /></g>
        <defs><clipPath id="beeBody"><ellipse cx="60" cy="72" rx="30" ry="26" /></clipPath></defs>
        <path d="M52 50 Q46 38 40 32 M68 50 Q74 38 80 32" stroke="#3a2c14" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="31" r="3.4" fill="#3a2c14" /><circle cx="80" cy="31" r="3.4" fill="#3a2c14" />
        <ellipse cx="60" cy="72" rx="30" ry="26" fill="#ffcf2e" />
        <g clipPath="url(#beeBody)">
          <rect x="20" y="82" width="80" height="8" fill="#3a2c14" /><rect x="20" y="96" width="80" height="8" fill="#3a2c14" />
        </g>
        <path d="M58 98 L62 98 L60 107 Z" fill="#3a2c14" />
        <Eye x={49} y={66} r={3.8} /><Eye x={71} y={66} r={3.8} delay={0.05} />
        <path d="M52 76 Q60 84 68 76" stroke="#3a2c14" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <Blush x={42} y={74} /><Blush x={78} y={74} />
      </g>
    </Frame>
  );
}

export function Corn() {
  const kernels = [];
  for (let y = 30; y <= 82; y += 8) for (let x = 50; x <= 70; x += 7) kernels.push([x, y]);
  return (
    <Frame bob={false}>
      <g className={T('an-o-b an-rock')}>
        <path d="M60 24 Q56 14 52 12 M60 24 Q60 12 60 7 M60 24 Q64 14 68 12" stroke="#c9a35a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="56" rx="17" ry="37" fill="#ffd23f" />
        {kernels.map(([x, y], i) => <circle key={i} cx={x + (Math.round((y - 30) / 8) % 2 ? 3 : 0) - 2} cy={y} r="2.8" fill="#f3b81f" />)}
        <path d="M60 110 Q26 100 32 56 Q44 78 60 94 Z" fill="#5fae45" />
        <path d="M60 110 Q94 100 88 56 Q76 78 60 94 Z" fill="#6fbd52" />
        <path d="M60 112 Q46 96 51 78 Q60 90 60 112 Z" fill="#7cc85a" />
        <path d="M60 112 Q74 96 69 78 Q60 90 60 112 Z" fill="#8bd466" />
      </g>
    </Frame>
  );
}

export function Pomegranate() {
  const seeds = [[88, 60], [96, 70], [92, 82], [80, 86], [74, 74], [82, 70], [88, 72], [70, 62], [80, 58], [96, 60], [86, 90], [76, 82]];
  return (
    <Frame bob={false}>
      <g className={T('an-o-b an-rock')}>
        <circle cx="40" cy="68" r="27" fill="#d7263d" />
        <ellipse cx="32" cy="58" rx="9" ry="14" fill="#f0586a" opacity="0.55" transform="rotate(20 32 58)" />
        <path d="M28 44 L31 33 L37 41 L41 31 L46 41 L51 33 L52 45 Q40 50 28 44 Z" fill="#a31a2c" />
      </g>
      <circle cx="86" cy="74" r="24" fill="#d7263d" />
      <circle cx="86" cy="74" r="20" fill="#fbe6e1" />
      <g className={T('an-twinkle')}>
        {seeds.map(([x, y], i) => <ellipse key={i} cx={x - 0 + (i % 2)} cy={y + 2} rx="4.2" ry="4.6" fill="#c4122f" style={{ animationDelay: `${(i % 4) * 0.3}s` }} />)}
      </g>
      <g fill="#fff" opacity="0.75">{seeds.map(([x, y], i) => <circle key={i} cx={x - 1.5 + (i % 2)} cy={y} r="1.1" />)}</g>
    </Frame>
  );
}

export function Lemon() {
  return (
    <Frame bob={false}>
      <g className={T('an-o-b an-rock')}>
        <ellipse cx="60" cy="68" rx="35" ry="26" fill="#ffe14a" transform="rotate(-20 60 68)" />
        <circle cx="92" cy="56.4" r="5.4" fill="#ffe14a" /><circle cx="28" cy="79.6" r="5.4" fill="#ffe14a" />
        <ellipse cx="50" cy="60" rx="10" ry="4.4" fill="#fff" opacity="0.55" transform="rotate(-20 50 60)" />
        <g fill="#f2c92d"><circle cx="66" cy="76" r="1.4" /><circle cx="74" cy="66" r="1.4" /><circle cx="56" cy="80" r="1.4" /><circle cx="44" cy="74" r="1.4" /><circle cx="70" cy="58" r="1.4" /></g>
        <rect x="87" y="46" width="5" height="8" rx="2" fill="#7a5a22" transform="rotate(30 90 50)" />
        <g className={T('an-o-bl an-sway')}>
          <path d="M92 48 Q96 22 118 20 Q116 44 92 48 Z" fill="#4fae4a" />
          <path d="M94 46 Q104 34 114 24" stroke="#3a8c36" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </Frame>
  );
}

export function Banana() {
  return (
    <Frame bob={false}>
      <g className={T('an-rock')}>
        <path d="M28 34 C24 80 62 106 104 86 L99 77 C72 88 46 66 45 34 Z" fill="#ffd93b" />
        <path d="M33 42 C33 78 62 97 95 83" stroke="#fff2a8" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M37 36 C38 74 66 98 100 82" stroke="#e6b81f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M28 34 L45 34 L43 22 L30 22 Z" fill="#8a6b2d" />
        <path d="M99 77 L104 86 L108 84 L104 75 Z" fill="#6b4a22" />
      </g>
    </Frame>
  );
}

export function Sun() {
  return (
    <Frame bob={false}>
      <g className={T('an-spin')}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M60 12 L67 30 L53 30 Z" fill="#ffb11f" transform={`rotate(${i * 30} 60 60)`} />
        ))}
      </g>
      <g className={T('an-pulse')}>
        <circle cx="60" cy="60" r="30" fill="#ffd23f" />
        <circle cx="60" cy="60" r="24" fill="#ffe27a" opacity="0.6" />
      </g>
      <Eye x={50} y={56} r={3.6} /><Eye x={70} y={56} r={3.6} delay={0.05} />
      <path d="M49 67 Q60 79 71 67" stroke="#b8611f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Blush x={43} y={66} /><Blush x={77} y={66} />
    </Frame>
  );
}

export function Flower() {
  const outer = Array.from({ length: 6 }, (_, i) => { const a = (i * 60 - 90) * Math.PI / 180; return [60 + 21 * Math.cos(a), 46 + 21 * Math.sin(a)]; });
  const mid = Array.from({ length: 5 }, (_, i) => { const a = (i * 72 - 54) * Math.PI / 180; return [60 + 12 * Math.cos(a), 46 + 12 * Math.sin(a)]; });
  return (
    <Frame bob={false}>
      <g className={T('an-o-b an-sway-s')}>
        <path d="M60 70 Q57 96 62 112" stroke="#3f9b4f" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <ellipse cx="45" cy="96" rx="13" ry="6" fill="#4fae4a" transform="rotate(-35 45 96)" />
        <ellipse cx="77" cy="90" rx="13" ry="6" fill="#4fae4a" transform="rotate(32 77 90)" />
        <g className={T('an-pulse')}>
          {outer.map(([x, y], i) => <circle key={`o${i}`} cx={x} cy={y} r="14" fill="#c41e3f" />)}
          <circle cx="60" cy="46" r="26" fill="#d62a4b" />
          {mid.map(([x, y], i) => <circle key={`m${i}`} cx={x} cy={y} r="9.5" fill="#e8506c" />)}
          <circle cx="60" cy="46" r="11" fill="#d62a4b" />
          <path d="M55 46 Q60 38 66 44 Q66 52 58 52 Q54 50 56 46 Q58 44 61 46" stroke="#a8143a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="48" cy="32" rx="6" ry="3" fill="#fff" opacity="0.35" transform="rotate(-35 48 32)" />
        </g>
      </g>
    </Frame>
  );
}
