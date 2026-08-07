// Simple reference-picture icons for concrete vocabulary words (colors,
// shapes, everyday objects) - matches Icons.jsx's line-icon convention
// exactly so these read as part of the same visual system. Deliberately
// limited to objects/nature/shapes, never people - see Lesson.jsx's
// content.image handling and the "no human figures" convention already
// followed by every mascot in this app.
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function HouseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-6h4v6" />
    </svg>
  );
}

export function MosqueIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1.8 1.6 1.8 3.4 0 5c-1.8-1.6-1.8-3.4 0-5Z" />
      <path d="M12 8v3" />
      <path d="M4 21v-6c0-2.8 1.8-4.8 4-5.5V21" />
      <path d="M20 21v-6c0-2.8-1.8-4.8-4-5.5V21" />
      <path d="M9.5 21v-4a2.5 2.5 0 0 1 5 0v4" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function CrescentIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 4.5A8 8 0 1 0 15.5 19.5A9.5 9.5 0 0 1 15.5 4.5Z" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6 7.3 7.3M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" />
    </svg>
  );
}

export function CircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

export function WaterDropIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c3.5 4.2 6 7.7 6 10.5a6 6 0 1 1-12 0C6 10.7 8.5 7.2 12 3Z" />
    </svg>
  );
}

export const VOCAB_ICONS = {
  house: HouseIcon,
  mosque: MosqueIcon,
  crescent: CrescentIcon,
  sun: SunIcon,
  circle: CircleIcon,
  water: WaterDropIcon,
};
