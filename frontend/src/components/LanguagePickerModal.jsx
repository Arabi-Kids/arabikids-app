import { translations } from '../lib/i18n/translations.js';
import HudMascot from './HudMascot.jsx';
import { GBFlag, SAFlag, MYFlag } from './FlagIcons.jsx';

const OPTIONS = [
  { code: 'en', Flag: GBFlag, labelKey: 'english' },
  { code: 'ar', Flag: SAFlag, labelKey: 'arabic' },
  { code: 'ms', Flag: MYFlag, labelKey: 'malay' },
];

// First-visit language picker - no "skip" option, per the product
// requirement that every guest chooses explicitly before continuing. Reads
// its own copy straight from the dictionary (English) since it renders
// before a language has been chosen.
export default function LanguagePickerModal({ onSelect }) {
  const copy = translations.en.languagePicker;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 31, 51, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '32px 28px',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <HudMascot pose="hero" size={64} style={{ margin: '0 auto 12px' }} />
        <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{copy.title}</h2>
        <p style={{ margin: '0 0 24px', color: '#6b7a8a', fontSize: '0.9rem' }}>{copy.subtitle}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => onSelect(opt.code)}
              className="btn btn-outline btn-chunky"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: '1.1rem' }}
            >
              <opt.Flag size={28} />
              {copy[opt.labelKey]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
