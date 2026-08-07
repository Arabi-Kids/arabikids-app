// Real SVG flags instead of flag emoji - Windows renders flag emoji as
// plain two-letter region codes ("GB" instead of 🇬🇧) since it ships no
// flag glyphs, which made the language switcher look broken/unstyled for
// Windows users. SVGs render identically everywhere.
const wrapperStyle = { display: 'inline-block', borderRadius: 3, overflow: 'hidden', verticalAlign: 'middle', lineHeight: 0 };

export function GBFlag({ size = 18 }) {
  return (
    <span style={{ ...wrapperStyle, width: size, height: size * 0.7 }}>
      <svg viewBox="0 0 20 14" width="100%" height="100%">
        <rect width="20" height="14" fill="#00247d" />
        <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.6" />
        <path d="M0 0L20 14M20 0L0 14" stroke="#cf142b" strokeWidth="1.1" />
        <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4.4" />
        <path d="M10 0V14M0 7H20" stroke="#cf142b" strokeWidth="2.6" />
      </svg>
    </span>
  );
}

export function SAFlag({ size = 18 }) {
  return (
    <span style={{ ...wrapperStyle, width: size, height: size * 0.7 }}>
      <svg viewBox="0 0 20 14" width="100%" height="100%">
        <rect width="20" height="14" fill="#006c35" />
        <rect x="3" y="9.4" width="14" height="1.5" rx="0.75" fill="#fff" />
        <rect x="3" y="9.4" width="2" height="1.5" rx="0.75" fill="#fff" />
      </svg>
    </span>
  );
}

export function MYFlag({ size = 18 }) {
  const stripeH = 14 / 7;
  return (
    <span style={{ ...wrapperStyle, width: size, height: size * 0.7 }}>
      <svg viewBox="0 0 20 14" width="100%" height="100%">
        <rect width="20" height="14" fill="#fff" />
        {[0, 2, 4, 6].map((i) => (
          <rect key={i} y={i * stripeH} width="20" height={stripeH} fill="#cc0001" />
        ))}
        <rect width="10" height="8" fill="#010066" />
        <circle cx="4.6" cy="4" r="2.3" fill="#ffcc00" />
        <circle cx="5.4" cy="4" r="2.3" fill="#010066" />
        <path d="M6.6 4 L7.6 3.3 L7.2 4.3 L8.3 4.3 L7.4 4.9 L7.7 5.9 L6.6 5.2 L5.5 5.9 L5.8 4.9 L4.9 4.3 L6 4.3 Z" fill="#ffcc00" />
      </svg>
    </span>
  );
}

export const FLAG_ICONS = { en: GBFlag, ar: SAFlag, ms: MYFlag };
