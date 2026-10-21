// Friendly flat SVG icons for Practical Life (wudu steps, water drops and the
// du'a scenes), in the brand colours - used instead of emoji so every device
// shows the same picture. Bathroom is a door/sign only, never depicted.

const BLUE = '#1B4F8A';
const SKIN = '#f2c9a0';
const WATER = '#4aa3e0';
const GOLD = '#E7A73E';
const PINK = '#e0678f';
const SKY = '#e7eff9';

const S = { stroke: BLUE, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' };

export function DropIcon({ size = 16, filled = true, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">
      <path
        d="M12 3 C16 9 18.5 12 18.5 15.5 A6.5 6.5 0 0 1 5.5 15.5 C5.5 12 8 9 12 3Z"
        fill={filled ? WATER : '#cfe3f5'}
        stroke={filled ? '#2b7fc0' : '#a9c7e3'}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function SpeakerIcon({ size = 26, color = BLUE }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M5 12 H10 L17 6 V26 L10 20 H5Z" fill={color} />
      <path d="M21 11 C24 14 24 18 21 21" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24.5 7.5 C29.5 12 29.5 20 24.5 24.5" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#1a7a4a" />
      <path d="M9 16.5 L14 21.5 L23 11" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Drop = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -6 C3.5 -1 5.5 1.5 5.5 4 A5.5 5.5 0 0 1 -5.5 4 C-5.5 1.5 -3.5 -1 0 -6Z" fill={WATER} stroke="#2b7fc0" strokeWidth="1.2" />
  </g>
);

const WUDU = {
  'WD-01': (
    <>
      <path d="M22 40 C6 29 5 17 13 13 C18 10.5 21.5 13.5 22 17 C22.5 13.5 26 10.5 31 13 C39 17 38 29 22 40Z" fill="#f6b8cc" {...S} />
      <circle cx="38" cy="9" r="2" fill={BLUE} />
      <circle cx="43" cy="5" r="2.6" fill={BLUE} />
    </>
  ),
  'WD-02': (
    <>
      <rect x="13" y="22" width="22" height="19" rx="8" fill={SKIN} {...S} />
      <rect x="14" y="10" width="5" height="16" rx="2.5" fill={SKIN} {...S} />
      <rect x="20" y="7" width="5" height="19" rx="2.5" fill={SKIN} {...S} />
      <rect x="26" y="10" width="5" height="16" rx="2.5" fill={SKIN} {...S} />
      <Drop x={39} y={14} />
      <Drop x={8} y={20} s={0.8} />
    </>
  ),
  'WD-03': (
    <>
      <path d="M6 26 C12 15 19 19 24 21 C29 19 36 15 42 26 C36 38 12 38 6 26Z" fill={PINK} {...S} />
      <path d="M6 26 C17 29 31 29 42 26" fill="none" {...S} />
      <Drop x={40} y={10} />
    </>
  ),
  'WD-04': (
    <>
      <path d="M24 8 C22 19 13 27 13 34 C13 40 19 41 24 39 C29 41 35 40 35 34 C35 27 26 19 24 8Z" fill={SKIN} {...S} />
      <ellipse cx="19" cy="35" rx="2.4" ry="1.8" fill={BLUE} />
      <ellipse cx="29" cy="35" rx="2.4" ry="1.8" fill={BLUE} />
      <Drop x={39} y={12} />
    </>
  ),
  'WD-05': (
    <>
      <circle cx="24" cy="25" r="16" fill={SKIN} {...S} />
      <circle cx="18" cy="22" r="2" fill={BLUE} />
      <circle cx="30" cy="22" r="2" fill={BLUE} />
      <path d="M17 30 Q24 36 31 30" fill="none" {...S} />
      <Drop x={8} y={8} s={0.8} />
      <Drop x={40} y={8} s={0.8} />
    </>
  ),
  'WD-06': (
    <>
      <path d="M12 36 L31 17" stroke={BLUE} strokeWidth="15" strokeLinecap="round" />
      <path d="M12 36 L31 17" stroke={SKIN} strokeWidth="10.5" strokeLinecap="round" />
      <path d="M5 43 L14 34" stroke={BLUE} strokeWidth="14" strokeLinecap="round" />
      <path d="M5 43 L14 34" stroke="#2f6db0" strokeWidth="9.5" strokeLinecap="round" />
      <circle cx="36" cy="12" r="7" fill={SKIN} {...S} />
      <path d="M40 6 C43 4 45 6 44 9" fill="none" {...S} />
      <Drop x={30} y={37} s={0.8} />
      <Drop x={41} y={27} s={0.7} />
    </>
  ),
  'WD-07': (
    <>
      <circle cx="24" cy="26" r="15" fill={SKIN} {...S} />
      <path d="M9 24 C10 11 38 11 39 24 C32 18 16 18 9 24Z" fill="#3a2a20" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 8 Q24 2 35 8" fill="none" stroke={WATER} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 4 Q24 -1 32 4" fill="none" stroke={WATER} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="18" cy="30" r="1.8" fill={BLUE} />
      <circle cx="30" cy="30" r="1.8" fill={BLUE} />
    </>
  ),
  'WD-08': (
    <>
      <path d="M27 6 C38 6 42 16 39 25 C37 32 31 33 31 39 C31 44 24 45 22 40" fill={SKIN} {...S} />
      <path d="M27 14 C33 14 35 20 33 25 C32 29 28 29 28 34" fill="none" {...S} />
      <Drop x={10} y={16} s={0.9} />
      <Drop x={11} y={34} s={0.7} />
    </>
  ),
  'WD-09': (
    <>
      <path d="M14 6 C21 6 23 12 23 19 L23 30 C32 31 41 33 41 38 C41 43 37 43 31 43 H14 C9 43 9 39 11 35 C13 29 9 22 11 14 C12 9 12 6 14 6Z" fill={SKIN} {...S} />
      <circle cx="34" cy="38" r="1.5" fill={BLUE} />
      <circle cx="29" cy="38" r="1.5" fill={BLUE} />
      <Drop x={36} y={14} />
    </>
  ),
  'WD-10': (
    <>
      <rect x="6" y="8" width="36" height="32" rx="8" fill={SKY} {...S} />
      <circle cx="15" cy="17" r="3.4" fill={GOLD} stroke={BLUE} strokeWidth="1.8" />
      <circle cx="15" cy="25" r="3.4" fill={GOLD} stroke={BLUE} strokeWidth="1.8" />
      <circle cx="15" cy="33" r="3.4" fill={GOLD} stroke={BLUE} strokeWidth="1.8" />
      <path d="M23 17 H36 M23 25 H36 M23 33 H36" {...S} />
    </>
  ),
};

const SCENES = {
  door: (
    <>
      <rect x="12" y="4" width="24" height="40" rx="3" fill="#c98a4b" {...S} />
      <rect x="17" y="9" width="14" height="8" rx="2" fill={SKY} {...S} />
      <circle cx="31" cy="27" r="2" fill={GOLD} stroke={BLUE} strokeWidth="1.6" />
    </>
  ),
  house: (
    <>
      <path d="M6 24 L24 7 L42 24" fill="none" {...S} />
      <path d="M11 22 V41 H37 V22 L24 11Z" fill="#fff3d6" {...S} />
      <rect x="20" y="29" width="8" height="12" rx="2" fill="#c98a4b" {...S} />
    </>
  ),
  plate: (
    <>
      <circle cx="24" cy="25" r="16" fill="#fff" {...S} />
      <circle cx="24" cy="25" r="9" fill={SKY} stroke="#9bb7d4" strokeWidth="1.6" />
      <path d="M5 8 V20 M9 8 V20 M7 8 V42" {...S} />
      <path d="M42 8 C38 12 38 18 42 22 V42" {...S} />
    </>
  ),
  bed: (
    <>
      <rect x="5" y="24" width="38" height="12" rx="3" fill="#8fb8e8" {...S} />
      <rect x="8" y="17" width="12" height="8" rx="4" fill="#fff" {...S} />
      <path d="M5 36 V42 M43 36 V42" {...S} />
      <path d="M34 8 A6 6 0 1 0 40 15 A5 5 0 1 1 34 8Z" fill={GOLD} stroke={BLUE} strokeWidth="1.6" />
    </>
  ),
  sun: (
    <>
      <circle cx="24" cy="24" r="10" fill={GOLD} {...S} />
      <path d="M24 4 V10 M24 38 V44 M4 24 H10 M38 24 H44 M10 10 L14 14 M34 34 L38 38 M38 10 L34 14 M14 34 L10 38" {...S} />
    </>
  ),
  shirt: (
    <path d="M17 6 L6 13 L11 21 L16 18 V42 H32 V18 L37 21 L42 13 L31 6 C29 10 19 10 17 6Z" fill="#8fb8e8" {...S} />
  ),
  mosque: (
    <>
      <path d="M10 42 V26 C10 14 38 14 38 26 V42Z" fill="#fff3d6" {...S} />
      <path d="M24 6 V12" {...S} />
      <circle cx="24" cy="5" r="1.8" fill={GOLD} />
      <rect x="39" y="14" width="5" height="28" rx="2" fill="#fff3d6" {...S} />
      <path d="M20 42 V34 A4 4 0 0 1 28 34 V42" fill={SKY} {...S} />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="10" width="38" height="26" rx="6" fill={GOLD} {...S} />
      <rect x="9" y="15" width="10" height="9" rx="2" fill={SKY} {...S} />
      <rect x="22" y="15" width="10" height="9" rx="2" fill={SKY} {...S} />
      <rect x="35" y="15" width="5" height="9" rx="2" fill={SKY} {...S} />
      <circle cx="14" cy="38" r="4" fill="#3a3a3a" stroke={BLUE} strokeWidth="1.6" />
      <circle cx="34" cy="38" r="4" fill="#3a3a3a" stroke={BLUE} strokeWidth="1.6" />
    </>
  ),
};

const SCENE_BY_DUA = {
  'DU-01': 'door',
  'DU-02': 'door',
  'DU-03': 'house',
  'DU-04': 'house',
  'DU-05': 'plate',
  'DU-06': 'plate',
  'DU-07': 'plate',
  'DU-08': 'bed',
  'DU-09': 'sun',
  'DU-10': 'shirt',
  'DU-11': 'mosque',
  'DU-12': 'mosque',
  'DU-13': 'bus',
};

function Frame({ children, size, label }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label={label} style={{ display: 'block' }}>
      {children}
    </svg>
  );
}

export function WuduIcon({ id, size = 36 }) {
  const art = WUDU[id];
  if (!art) return null;
  return <Frame size={size} label={id}>{art}</Frame>;
}

export function SceneIcon({ id, size = 64 }) {
  const art = SCENES[SCENE_BY_DUA[id]];
  if (!art) return null;
  return <Frame size={size} label={SCENE_BY_DUA[id]}>{art}</Frame>;
}
