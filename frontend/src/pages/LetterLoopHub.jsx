import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { primaryGlyph } from '../lib/contentHelpers.js';
import { interpolate as fill } from '../lib/i18n/translations.js';
import { LETTER_STAGES, stageLetterRows, stageOpen } from '../lib/letterStages.js';
import useLetterStages from '../hooks/useLetterStages.js';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import Seo from '../components/Seo.jsx';

export default function LetterLoopHub() {
  const { isPaid, isAdmin } = useAuth();
  const { t } = useLanguage();
  const copy = t('interactive.letters');
  const st = copy.stages;
  const { index, completed, passed, loading, error, activeChild } = useLetterStages();

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const totalDone = index.filter((r) => completed.includes(r.id)).length;

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <Seo title={`${copy.title} | ArabiKids`} description={copy.subtitle} path="/lessons/letters" />
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {t('lessonsHub.title')}
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <CharacterAvatar id="hudi" state="wave" size={96} />
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{copy.title}</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{copy.subtitle}</p>
          {activeChild && (
            <span className="badge badge-gold" style={{ marginTop: 8, display: 'inline-block' }}>
              ⭐ {fill(st.progress, { done: totalDone, total: index.length || 28 })}
            </span>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {index.length === 0 ? (
        <div className="card" style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#4b5a6a' }}>{copy.noneYet}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginTop: 24 }}>
          {LETTER_STAGES.map((stage) => {
            const letters = stageLetterRows(index, stage);
            const done = letters.filter((l) => completed.includes(l.id)).length;
            const isPassed = passed.includes(stage.n);
            const open = stageOpen(stage.n, passed, isAdmin());
            const needsPlan = letters.length > 0 && letters.every((l) => !l.isFree) && !isPaid() && !isAdmin();
            const allDone = letters.length > 0 && done === letters.length;
            const pct = letters.length ? Math.round((done / letters.length) * 100) : 0;
            const target = needsPlan ? '/pricing' : open ? `/lessons/letters/stage/${stage.n}` : null;
            const body = (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                  <span style={{ fontWeight: 900, color: 'var(--color-blue)', fontSize: '1.05rem' }}>{fill(st.label, { n: stage.n })}</span>
                  {stage.n === 1 && <span className="badge badge-free">{st.free}</span>}
                  {isPassed && <span className="badge badge-gold">⭐ {st.passed}</span>}
                  {!isPassed && !open && !needsPlan && <span className="badge badge-locked">🔒 {st.lockedShort}</span>}
                  {!isPassed && open && !needsPlan && allDone && <span className="badge badge-orange">{st.testReady}</span>}
                  {needsPlan && <span className="badge badge-locked">{copy.subscribe}</span>}
                </div>
                <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1.1rem' }}>{st.names[stage.n]}</p>
                <p style={{ margin: '0 0 10px', color: '#6b7a8a', fontSize: '0.85rem' }}>{fill(st.range, { from: stage.from, to: stage.to })}</p>
                <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
                  {letters.map((l) => (
                    <span
                      key={l.id}
                      className="arabic-text"
                      style={{
                        fontSize: '1.6rem',
                        lineHeight: 1.7,
                        minWidth: 38,
                        textAlign: 'center',
                        borderRadius: 10,
                        background: completed.includes(l.id) ? 'rgba(200,150,12,0.16)' : 'rgba(27,79,138,0.06)',
                      }}
                    >
                      {l.data ? primaryGlyph(l.data.letter) : primaryGlyph(l.label)}
                    </span>
                  ))}
                </div>
                <p style={{ margin: '0 0 8px', color: '#4b5a6a', fontSize: '0.9rem' }}>{st.blurbs[stage.n]}</p>
                <div style={{ background: 'rgba(27,79,138,0.1)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: stage.accent, height: '100%', borderRadius: 999 }} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#8394a3', fontWeight: 700 }}>
                  {open ? fill(st.progress, { done, total: letters.length }) : fill(st.lockedNote, { n: stage.n - 1 })}
                </p>
              </>
            );
            return target ? (
              <Link key={stage.n} to={target} className="card card-kid" style={{ '--card-accent': stage.accent, display: 'block' }}>
                {body}
              </Link>
            ) : (
              <div key={stage.n} className="card card-kid" style={{ '--card-accent': stage.accent, display: 'block', opacity: 0.65 }}>
                {body}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
