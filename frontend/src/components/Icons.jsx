const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function BookIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5c3 -1.5 6 -1.5 8 0c2 -1.5 5 -1.5 8 0v14c-3 -1.5 -6 -1.5 -8 0c-2 -1.5 -5 -1.5 -8 0Z" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function PathIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="18" r="2.3" />
      <circle cx="19" cy="6" r="2.3" />
      <path d="M7 16.5C10 12 13 9 17 7.5" />
    </svg>
  );
}

export function TargetIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function DeviceIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M11 19h2" />
    </svg>
  );
}

export function StarSparkleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z" />
    </svg>
  );
}

export function SpeakerIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9Z" />
      <path d="M17 8.5a5 5 0 0 1 0 7" />
      <path d="M19.5 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}
