import { playTap } from '../../lib/sounds.js';

/** One tap-to-hear card: Arabic (verbatim from the reviewed pack), optional
 * caption and meaning. `onHear` is called from the tap, so it is always a
 * user gesture (audio unlock rule). */
export function ArabicHearCard({ arabic, caption, meaning, hint, onHear, tone = 'blue' }) {
  const colors =
    tone === 'gold'
      ? { bg: 'rgba(200,150,12,0.08)', border: 'var(--color-gold)' }
      : { bg: 'rgba(27,79,138,0.05)', border: 'var(--color-blue)' };
  return (
    <button
      type="button"
      onClick={() => {
        playTap();
        onHear?.();
      }}
      style={{
        background: colors.bg,
        border: `3px solid ${colors.border}`,
        borderRadius: 20,
        padding: '16px 14px',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {caption && <span style={{ display: 'block', fontWeight: 800, color: 'var(--color-blue)', marginBottom: 6 }}>{caption}</span>}
      <span className="arabic-text" dir="rtl" style={{ display: 'block', textAlign: 'center', fontSize: '1.9rem', lineHeight: 1.9 }}>
        {arabic}
      </span>
      {meaning && <span style={{ display: 'block', marginTop: 8, color: '#4b5a6a', fontWeight: 700 }}>{meaning}</span>}
      {hint && <span style={{ display: 'block', marginTop: 6, fontSize: '0.72rem', color: '#8ea0b6' }}>{hint}</span>}
    </button>
  );
}

export function AudioStatus({ status, copy }) {
  if (!status) return null;
  return (
    <p style={{ margin: '8px 0 0', fontSize: '0.78rem', fontWeight: 700, color: '#8394a3', textAlign: 'center' }}>
      {status === 'coming-soon' && copy.audioComingSoon}
      {status === 'preview' && copy.audioPreview}
      {status === 'tts-preview' && copy.audioTtsPreview}
    </p>
  );
}

export { WuduIcon, SceneIcon, DropIcon, CheckIcon, SpeakerIcon } from '../icons/PracticalIcons.jsx';
