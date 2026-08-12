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

// Placeholder line-icons for the new topic categories (Animals & Farm,
// Home, School) referenced by the interactive Arabic Curriculum's picture-
// word-sound cards and games - explicitly simple stand-ins, not the real
// illustrations/animations that category needs (see the plan's "Jimmy"
// content-authoring flag). Swappable for real assets with no code change
// once sourced, same `image: {type:'icon', key:'cow'}` lookup convention.

export function CowIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9c-1.5 0-2.5-1-2.5-2S4.5 5 6 5.5" />
      <path d="M18 9c1.5 0 2.5-1 2.5-2S19.5 5 18 5.5" />
      <path d="M5.5 11c0-3 2.9-5.5 6.5-5.5s6.5 2.5 6.5 5.5v4.5c0 3-2.9 5.5-6.5 5.5s-6.5-2.5-6.5-5.5Z" />
      <circle cx="9.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9.5 16c.8.6 1.7.6 2.5 0" />
      <path d="M6 14.5c-1 .3-1.5 1-1.5 1.8" />
    </svg>
  );
}

export function ChickenIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 21c0-4.5 2-8.5 5.5-8.5S18 12 18 16.5" />
      <circle cx="13.5" cy="8" r="4" />
      <path d="M13.5 4.5V3" />
      <path d="M17 7.5l3 .5-3 1" />
      <path d="M11.5 8h0.01" />
      <path d="M9 15h6" />
    </svg>
  );
}

export function CatIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 5 8 9.5" />
      <path d="M17.5 5 16 9.5" />
      <path d="M6.5 12c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6-2.5 6-5.5 6-5.5-2.5-5.5-6Z" />
      <circle cx="9.7" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.3" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M12 13v1" />
      <path d="M4 12.5h3M4 14.5h3" />
      <path d="M17 12.5h3M17 14.5h3" />
    </svg>
  );
}

export function TreeIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6" />
      <path d="M9.5 21h5" />
    </svg>
  );
}

export function PencilIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 4.5 19.5 8.5 8 20 4 20.5 4.5 16.5Z" />
      <path d="M13.5 6.5l3.5 3.5" />
    </svg>
  );
}

export function ChairIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4v9" />
      <path d="M6 4h9" />
      <path d="M15 4v16" />
      <path d="M6 13h9" />
      <path d="M6 13v7" />
      <path d="M6 20h1.5M13.5 20H15" />
    </svg>
  );
}

export function BedIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 20v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 17h18" />
      <path d="M5 11V7a1 1 0 0 1 1-1h5v4" />
      <path d="M3 20v1.5M21 20v1.5" />
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
  cow: CowIcon,
  chicken: ChickenIcon,
  cat: CatIcon,
  tree: TreeIcon,
  pencil: PencilIcon,
  chair: ChairIcon,
  bed: BedIcon,
};
