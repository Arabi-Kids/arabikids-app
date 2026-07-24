import { speakSmart } from '../lib/speech.js';
import HudMascot from './HudMascot.jsx';

// Pure presentational "mind map" recap - a simple visual summary of what was
// just covered, not a true node-diagram (see plan discussion). Takes data
// already fetched by the caller (StageCheckpoint.jsx / StageRecap.jsx),
// doesn't fetch anything itself.
export default function LessonRecapCard({ recapGroup }) {
  if (!recapGroup) return null;

  return (
    <div className="card" style={{ marginBottom: 20, background: 'rgba(27,79,138,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <HudMascot pose="mark" size={40} />
        <span className="badge badge-gold">What You Learned</span>
      </div>
      <p style={{ margin: '0 0 16px', color: '#4b5a6a', fontSize: '1.05rem' }}>{recapGroup.summary}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {recapGroup.highlights.map((h, i) => (
          <button
            key={i}
            type="button"
            onClick={() => speakSmart(h.arabic, { rate: 0.6 })}
            style={{
              background: '#fff',
              border: '2px solid var(--color-blue)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.4rem', margin: '0 0 4px' }}>{h.arabic}</p>
            <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.85rem' }}>{h.label}</p>
            {h.note && <p style={{ margin: 0, fontSize: '0.75rem', color: '#8ea0b6' }}>{h.note}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
