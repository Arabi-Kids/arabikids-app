import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getLevelPrintableData, isLevelComplete } from '../lib/db.js';
import { SHAPES } from '../components/LetterPositions.jsx';
import { speakSmart } from '../lib/speech.js';
import HudMascot from '../components/HudMascot.jsx';

const POSITION_ORDER = ['isolated', 'initial', 'medial', 'final'];
const POSITION_LABELS = { isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' };

// Print-optimized worksheet - @media print CSS lets the browser's own
// "Print to PDF" cover the hard-copy need, no PDF library required. Gated
// behind isLevelComplete so it only unlocks once every stage in the level
// is mastered.
export default function LevelPrintable() {
  const { levelId } = useParams();
  const { activeChild } = useActiveChild();
  const [level, setLevel] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([getCurriculum(), isLevelComplete(activeChild.id, Number(levelId)), getLevelPrintableData(Number(levelId))])
      .then(([{ levels }, complete, printableData]) => {
        setLevel(levels.find((l) => l.id === Number(levelId)));
        setUnlocked(complete);
        setData(printableData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [levelId, activeChild]);

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;
  if (error) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;

  if (!level) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Level not found</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">Not quite yet</h1>
        <p className="page-subtitle">Complete every stage in {level.name} first to unlock its printable worksheet.</p>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  return (
    <div className="container printable-worksheet" style={{ padding: '48px 0', maxWidth: 900 }}>
      <style>{`
        @media print {
          nav, footer, .no-print { display: none !important; }
          .printable-worksheet { padding: 0 !important; max-width: none !important; }
          .print-letter-grid { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to="/lessons/curriculum" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
          ← Back to Curriculum
        </Link>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
      </div>

      <h1 className="page-title" style={{ textAlign: 'center' }}>{level.name} Practice Sheet</h1>
      <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: 32 }}>
        Everything you've learned in {level.name} - great for extra practice on paper.
      </p>

      {data.letters.length > 0 && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>The Letters</h2>
          <div className="print-letter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16, marginBottom: 32 }}>
            {data.letters.map((l) => (
              <div key={l.letter} className="card no-print-shadow" style={{ textAlign: 'center', padding: 12 }}>
                <button
                  type="button"
                  onClick={() => speakSmart(l.letter, { rate: 0.6 })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                >
                  <p className="arabic-text" dir="rtl" style={{ fontSize: '2.2rem', margin: '0 0 4px' }}>{l.letter}</p>
                </button>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.85rem' }}>{l.name}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {POSITION_ORDER.filter((p) => p === 'isolated' || l.positions?.[p]).map((p) => (
                    <span key={p} className="arabic-text" dir="rtl" title={POSITION_LABELS[p]} style={{ fontSize: '1.1rem', color: '#4b5a6a' }}>
                      {SHAPES[p](l.letter)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.vocabulary.length > 0 && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>Key Vocabulary</h2>
          <div className="print-letter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
            {data.vocabulary.map((v, i) => (
              <div key={i} className="card no-print-shadow" style={{ textAlign: 'center', padding: 12 }}>
                <button
                  type="button"
                  onClick={() => speakSmart(v.arabic, { rate: 0.6 })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                >
                  <p className="arabic-text" dir="rtl" style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>{v.arabic}</p>
                </button>
                {v.transliteration && <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.8rem' }}>"{v.transliteration}"</p>}
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#4b5a6a' }}>{v.meaning}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.comparisons.length > 0 && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>Compare Both Sides</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
            {data.comparisons.map((cmp, i) => (
              <div key={i} className="card" style={{ padding: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                {cmp.items.map((item, j) => (
                  <div key={j} style={{ textAlign: 'center', flex: 1 }}>
                    <p className="arabic-text" dir="rtl" style={{ fontSize: '1.4rem', margin: '0 0 4px' }}>{item.arabic}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#8ea0b6' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {data.tanweenForms && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>Tanween</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, maxWidth: 480 }}>
            {data.tanweenForms.forms.map((f) => (
              <div key={f.key} className="card" style={{ textAlign: 'center', padding: 12 }}>
                <p className="arabic-text" dir="rtl" style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>{f.arabic}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#8ea0b6' }}>{f.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.tajweedRules.length > 0 && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>Tajweed Rules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {data.tajweedRules.map((rule) => (
              <div key={rule.key} className="card" style={{ padding: 14 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--color-blue)' }}>{rule.name}</p>
                <p style={{ margin: '0 0 8px', color: '#4b5a6a', fontSize: '0.9rem' }}>{rule.kidExplanation}</p>
                <p className="arabic-text" dir="rtl" style={{ fontSize: '1.2rem', margin: 0 }}>{rule.example.arabic}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
