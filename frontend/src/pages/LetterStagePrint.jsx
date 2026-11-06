import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { shuffled } from '../lib/contentHelpers.js';
import { interpolate as fill } from '../lib/i18n/translations.js';
import { LETTER_STAGES, letterItem, stageLetterRows, stageOpen } from '../lib/letterStages.js';
import useLetterStages from '../hooks/useLetterStages.js';
import AnimalArt, { hasArt } from '../components/animals/AnimalArt.jsx';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import Seo from '../components/Seo.jsx';

const KINDS = ['tracing', 'flashcards', 'match', 'certificate'];

const PRINT_CSS = `
  .sheet-pic { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  @media print {
    header, nav, footer, .no-print { display: none !important; }
    .print-sheet { padding: 0 !important; max-width: none !important; }
    .print-row, .flash-card, .cert { break-inside: avoid; }
    body { background: #fff !important; }
  }
`;

function Picture({ item, size }) {
  return (
    <span className="sheet-pic" style={{ display: 'inline-flex' }}>
      {hasArt(item.art) ? <AnimalArt name={item.art} size={size} /> : <span style={{ fontSize: size * 0.8 }}>{item.emoji}</span>}
    </span>
  );
}

function TracingSheet({ items, st }) {
  return (
    <div>
      <p style={{ color: '#4b5a6a' }}>{st.tracingTip}</p>
      {items.map((it) => (
        <div key={it.id} className="print-row" dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px dashed #c9d3df', padding: '8px 0' }}>
          <span className="arabic-text" style={{ fontSize: '3.4rem', lineHeight: 1.6, width: 86, textAlign: 'center', color: '#1b4f8a' }}>{it.glyph}</span>
          {[0, 1, 2].map((i) => (
            <span key={i} className="arabic-text" style={{ fontSize: '3.4rem', lineHeight: 1.6, width: 76, textAlign: 'center', color: '#c3ccd8', border: '1.5px solid #d5dbe3', borderRadius: 8 }}>{it.glyph}</span>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <span key={`e${i}`} style={{ width: 76, height: 76, border: '1.5px solid #d5dbe3', borderRadius: 8 }} />
          ))}
          <span dir="ltr" style={{ marginInlineStart: 'auto', fontWeight: 800, color: '#1b4f8a', fontSize: '0.9rem' }}>{it.name}</span>
        </div>
      ))}
    </div>
  );
}

function Flashcards({ items, st }) {
  return (
    <div>
      <p style={{ color: '#4b5a6a' }}>{st.flashTip}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {items.map((it) => (
          <div key={it.id} className="flash-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '2px dashed #8ea0b6', borderRadius: 10, minHeight: 150 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderInlineEnd: '2px dashed #c9d3df' }}>
              <span className="arabic-text" dir="rtl" style={{ fontSize: '4rem', lineHeight: 1.5, color: '#1b4f8a' }}>{it.glyph}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 }}>
              <Picture item={it} size={64} />
              <span style={{ fontWeight: 800, color: '#1b4f8a' }}>{it.name}</span>
              {it.english && <span style={{ fontSize: '0.8rem', color: '#6b7a8a' }}>{it.english}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchSheet({ items, st }) {
  const pictures = useMemo(() => shuffled(items), [items]);
  return (
    <div>
      <p style={{ color: '#4b5a6a' }}>{st.matchTip}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 140, rowGap: 14, maxWidth: 560, margin: '0 auto' }}>
        {items.map((it, i) => (
          <div key={it.id} style={{ display: 'contents' }}>
            <div className="print-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #d5dbe3', borderRadius: 12, padding: '4px 14px' }}>
              <span className="arabic-text" dir="rtl" style={{ fontSize: '3rem', lineHeight: 1.6, color: '#1b4f8a' }}>{it.glyph}</span>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: '#1b4f8a' }} />
            </div>
            <div className="print-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #d5dbe3', borderRadius: 12, padding: '4px 14px' }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: '#1b4f8a' }} />
              <Picture item={pictures[i]} size={60} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Certificate({ stage, st, childName }) {
  const date = new Date().toLocaleDateString();
  return (
    <div className="cert" style={{ border: '10px double #c8960c', borderRadius: 20, padding: '40px 28px', textAlign: 'center', background: '#fffdf5', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      <CharacterAvatar id="hudi" state="cheer" size={110} style={{ margin: '0 auto 6px' }} />
      <h2 style={{ color: '#1b4f8a', fontSize: '2rem', margin: '4px 0 18px' }}>{st.certTitle}</h2>
      <p style={{ margin: 0, color: '#6b7a8a' }}>ArabiKids</p>
      <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#c8960c', margin: '18px 0' }}>{childName || '________________'}</p>
      <p style={{ fontSize: '1.2rem', margin: '0 0 6px', color: '#1c2733' }}>{fill(st.certBody, { n: stage.n, name: st.names[stage.n] })}</p>
      <p style={{ color: '#4b5a6a', margin: '14px 0 26px' }}>{st.certLine}</p>
      <p style={{ color: '#6b7a8a', margin: 0 }}>{st.certDate}: {date}</p>
    </div>
  );
}

export default function LetterStagePrint() {
  const { stageNo, kind } = useParams();
  const { isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const copy = t('interactive.letters');
  const st = copy.stages;
  const { rows, passed, loading, activeChild } = useLetterStages();
  const stage = LETTER_STAGES.find((s) => s.n === Number(stageNo));
  const items = useMemo(() => (stage ? stageLetterRows(rows, stage).map((r) => letterItem(r, language)) : []), [rows, stage, language]);

  if (!stage || !KINDS.includes(kind)) return <Navigate to="/lessons/letters" replace />;
  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;
  const base = `/lessons/letters/stage/${stage.n}`;
  const devPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has('preview'); // dev server only
  if (!devPreview && (!stageOpen(stage.n, passed, isAdmin()) || (kind === 'certificate' ? !(passed.includes(stage.n) || isAdmin()) : items.length === 0))) {
    return <Navigate to={base} replace />;
  }

  const title = { tracing: st.printTracing, flashcards: st.printFlash, match: st.printMatch, certificate: st.printCertificate }[kind];

  return (
    <div className="container print-sheet" style={{ padding: '40px 24px', maxWidth: 820 }}>
      <style>{PRINT_CSS}</style>
      <Seo title={`${title} | ${fill(st.label, { n: stage.n })} | ArabiKids`} description={st.printDesc} path={`${base}/print/${kind}`} />
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Link to={base} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{st.printBack}</Link>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>🖨️ {st.printNow}</button>
      </div>
      {kind !== 'certificate' && (
        <h1 className="page-title" style={{ marginTop: 0 }}>
          {title}: {fill(st.label, { n: stage.n })} · {st.names[stage.n]}
        </h1>
      )}
      {kind === 'tracing' && <TracingSheet items={items} st={st} />}
      {kind === 'flashcards' && <Flashcards items={items} st={st} />}
      {kind === 'match' && <MatchSheet items={items} st={st} />}
      {kind === 'certificate' && <Certificate stage={stage} st={st} childName={activeChild?.name} />}
    </div>
  );
}
