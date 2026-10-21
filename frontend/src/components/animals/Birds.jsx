import { Frame, Eye, Blush } from './parts.jsx';

const T = (extra = '') => `an-part ${extra}`;

export function Duck() {
  return (
    <Frame>
      <ellipse cx="60" cy="88" rx="34" ry="24" fill="#ffd23f" />
      <g className={T('an-o-t an-flap')}><ellipse cx="30" cy="88" rx="10" ry="17" fill="#f5bd1f" transform="rotate(22 30 88)" /></g>
      <g className={T('an-o-t an-flap')} style={{ animationDelay: '0.3s' }}><ellipse cx="90" cy="88" rx="10" ry="17" fill="#f5bd1f" transform="rotate(-22 90 88)" /></g>
      <ellipse cx="48" cy="110" rx="9" ry="3.5" fill="#ff9a2e" /><ellipse cx="72" cy="110" rx="9" ry="3.5" fill="#ff9a2e" />
      <circle cx="60" cy="50" r="25" fill="#ffd23f" />
      <path d="M58 26 Q54 17 61 20 Q60 25 64 24 Q62 19 68 21 Q64 27 62 28 Z" fill="#ffd23f" />
      <path d="M43 56 Q60 47 77 56 Q78 71 60 71 Q42 71 43 56 Z" fill="#ff9a2e" />
      <path d="M48 61 Q60 67 72 61" stroke="#e07a10" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="56" r="1.3" fill="#e07a10" /><circle cx="65" cy="56" r="1.3" fill="#e07a10" />
      <Eye x={49} y={45} r={3.8} /><Eye x={71} y={45} r={3.8} delay={0.05} />
      <Blush x={38} y={55} /><Blush x={82} y={55} />
    </Frame>
  );
}

export function Hen() {
  return (
    <Frame>
      <g className={T('an-o-l an-sway-s')}>
        <ellipse cx="92" cy="62" rx="5" ry="14" fill="#b8652a" transform="rotate(30 92 62)" />
        <ellipse cx="97" cy="72" rx="5" ry="15" fill="#d78845" transform="rotate(55 97 72)" />
        <ellipse cx="94" cy="82" rx="5" ry="14" fill="#c9742f" transform="rotate(75 94 82)" />
      </g>
      <path d="M54 100 V110 M70 100 V110 M48 110 H60 M64 110 H76" stroke="#f0a020" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="62" cy="76" r="29" fill="#fff3dc" />
      <g className={T('an-o-tl an-flap-s')}><ellipse cx="68" cy="80" rx="17" ry="13" fill="#f0cf94" transform="rotate(15 68 80)" /><path d="M58 80 Q68 86 78 80 M60 86 Q68 90 76 86" stroke="#d9b370" strokeWidth="1.6" fill="none" strokeLinecap="round" /></g>
      <circle cx="36" cy="50" r="16" fill="#fff3dc" />
      <g className={T('an-o-b an-sway-s')}><circle cx="29" cy="35" r="5.4" fill="#e63946" /><circle cx="36.5" cy="31" r="6" fill="#e63946" /><circle cx="44" cy="35" r="5.2" fill="#e63946" /></g>
      <path d="M21 49 L8 54 L21 59 Z" fill="#ffb02e" />
      <ellipse cx="27" cy="63" rx="4.2" ry="6.4" fill="#e63946" />
      <Eye x={33} y={46} r={3.4} />
      <Blush x={40} y={56} rx={4} ry={2.6} />
    </Frame>
  );
}

export function Falcon() {
  return (
    <Frame>
      <g className={T('an-o-tl an-sway-s')}>
        <path d="M66 84 L94 114 L80 116 L56 96 Z" fill="#4a3626" />
        <path d="M70 92 L82 104 M64 98 L74 110" stroke="#2f2218" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <path d="M50 104 V114 M64 104 V114 M44 114 H56 M58 114 H70" stroke="#f2b632" strokeWidth="3.4" strokeLinecap="round" />
      <ellipse cx="58" cy="76" rx="25" ry="33" fill="#6b4a32" transform="rotate(-16 58 76)" />
      <ellipse cx="48" cy="80" rx="14" ry="25" fill="#f1e3c9" transform="rotate(-16 48 80)" />
      <path d="M38 70 Q44 75 50 70 M37 80 Q43 85 49 80 M37 90 Q43 95 49 90 M40 100 Q45 104 50 100" stroke="#6b4a32" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g className={T('an-o-tl an-flap-s')}>
        <path d="M60 52 Q86 56 84 94 Q82 108 74 110 Q64 90 58 60 Z" fill="#4a3626" />
        <path d="M66 66 Q74 80 76 100" stroke="#6b4a32" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g className={T('an-o-b an-sway-s')}>
        <circle cx="46" cy="38" r="20" fill="#4a3626" />
        <ellipse cx="40" cy="47" rx="12" ry="9.5" fill="#f1e3c9" />
        <path d="M44 38 Q40 50 44 58" stroke="#2f2218" strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <path d="M26 33 Q35 31 42 36" stroke="#2f2218" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <circle cx="38" cy="38" r="6" fill="#f2b632" />
        <Eye x={38} y={38} r={3.8} />
        <ellipse cx="27" cy="42" rx="4.6" ry="3.2" fill="#f2b632" />
        <path d="M25 42 Q12 42 15 58 Q19 50 29 48 Z" fill="#aeb6bf" />
        <path d="M17 52 L23 47" stroke="#8a929b" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

export function Peacock() {
  const angles = [-72, -54, -36, -18, 0, 18, 36, 54, 72];
  return (
    <Frame>
      <g className={T('an-o-b an-pulse')}>
        {angles.map((a) => (
          <g key={a} transform={`rotate(${a} 60 96)`}>
            <ellipse cx="60" cy="48" rx="9.5" ry="31" fill="#1fa98b" />
            <ellipse cx="60" cy="36" rx="6" ry="9" fill="#2a62b8" />
            <circle cx="60" cy="35" r="3.2" fill="#f2c230" />
          </g>
        ))}
      </g>
      <path d="M48 110 Q42 82 54 66 Q60 60 66 66 Q78 82 72 110 Z" fill="#1f6fb0" />
      <ellipse cx="60" cy="92" rx="10" ry="16" fill="#2b8fd0" opacity="0.7" />
      <g className={T('an-o-b an-sway-s')}>
        <path d="M60 46 L53 30 M60 46 L60 27 M60 46 L67 30" stroke="#2a4f9a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="53" cy="29" r="2.4" fill="#1fa98b" /><circle cx="60" cy="26" r="2.4" fill="#1fa98b" /><circle cx="67" cy="29" r="2.4" fill="#1fa98b" />
        <circle cx="60" cy="54" r="11" fill="#1f6fb0" />
        <ellipse cx="55" cy="52" rx="3.8" ry="4.4" fill="#fff" /><ellipse cx="65" cy="52" rx="3.8" ry="4.4" fill="#fff" />
        <Eye x={55} y={52} r={2.2} /><Eye x={65} y={52} r={2.2} delay={0.05} />
        <path d="M56.5 58 L63.5 58 L60 64 Z" fill="#ff9a2e" />
      </g>
    </Frame>
  );
}

export function Sparrow() {
  return (
    <Frame>
      <g className={T('an-o-l an-sway-s')}><path d="M84 78 L110 90 L106 100 L80 90 Z" fill="#7a5236" /></g>
      <path d="M54 100 V110 M68 100 V110 M49 110 H59 M63 110 H73" stroke="#c9906a" strokeWidth="3" strokeLinecap="round" />
      <g className={T('an-hop')}>
        <ellipse cx="62" cy="82" rx="27" ry="21" fill="#b07a4c" />
        <ellipse cx="55" cy="91" rx="17" ry="10" fill="#efe0c8" />
        <g className={T('an-o-tl an-flap-s')}><ellipse cx="68" cy="80" rx="15" ry="10.5" fill="#8a5a38" transform="rotate(20 68 80)" /><path d="M60 78 L74 84 M62 83 L76 88" stroke="#5e3d24" strokeWidth="1.6" strokeLinecap="round" /></g>
        <circle cx="40" cy="58" r="18" fill="#b07a4c" />
        <path d="M23 56 Q40 34 58 56 Q40 46 23 56 Z" fill="#8a4f2c" />
        <ellipse cx="40" cy="66" rx="10" ry="6.5" fill="#efe0c8" />
        <ellipse cx="33" cy="72" rx="7.5" ry="5" fill="#2b221b" />
        <path d="M23 58 L11 62 L23 66 Z" fill="#8d8a92" />
        <Eye x={36} y={55} r={3.2} />
      </g>
    </Frame>
  );
}

export function Dove() {
  return (
    <Frame>
      <g className={T('an-o-l an-sway-s')}>
        <path d="M84 82 L113 86 L84 92 Z" fill="#e6dedb" />
        <path d="M86 86 L108 87" stroke="#cfc6c2" strokeWidth="1.4" />
      </g>
      <path d="M54 98 V108 M68 98 V108 M49 108 H59 M63 108 H73" stroke="#e08a86" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="80" rx="29" ry="20" fill="#f7f3f0" />
      <g className={T('an-o-l an-flap')}>
        <path d="M44 76 Q66 44 100 58 Q92 86 52 90 Q42 86 44 76 Z" fill="#dcd5d1" />
        <path d="M54 80 Q72 66 92 64 M56 86 Q74 76 92 72" stroke="#bfb6b1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="38" cy="56" r="16" fill="#f7f3f0" />
      <path d="M30 68 Q38 75 48 68" stroke="#d9a39f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M23 53 L11 57 L23 61 Z" fill="#f0a38e" />
      <Eye x={34} y={52} r={3} />
      <Blush x={42} y={61} rx={4} ry={2.6} />
    </Frame>
  );
}
