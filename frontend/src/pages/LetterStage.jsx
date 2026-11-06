import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { interpolate as fill } from '../lib/i18n/translations.js';
import { LETTER_STAGES, letterItem, stageLetterRows, stageOpen } from '../lib/letterStages.js';
import useLetterStages from '../hooks/useLetterStages.js';
import TapMatchGame from '../components/games/TapMatchGame.jsx';
import MemoryGame from '../components/games/MemoryGame.jsx';
import AnimalArt, { hasArt } from '../components/animals/AnimalArt.jsx';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import Seo from '../components/Seo.jsx';

function Picture({ item, size = 56 }) {
  return hasArt(item.art) ? <AnimalArt name={item.art} size={size} /> : <span style={{ fontSize: size * 0.8 }}>{item.emoji}</span>;
}

const glyphStyle = { textAlign: 'center', fontSize: '2.2rem', lineHeight: 1.7 };

export default function LetterStage() {
  const { stageNo } = useParams();
  const { isPaid, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const copy = t('interactive.letters');
  const st = copy.stages;
  const { rows, completed, passed, loading, error, activeChild } = useLetterStages();
  const [game, setGame] = useState(null); // 'picture' | 'memory' | 'name'

  const stage = LETTER_STAGES.find((s) => s.n === Number(stageNo));
  const items = useMemo(() => (stage ? stageLetterRows(rows, stage).map((r) => letterItem(r, language)) : []), [rows, stage, language]);

  if (!stage) return <Navigate to="/lessons/letters" replace />;
  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const open = stageOpen(stage.n, passed, isAdmin());
  if (!open) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <CharacterAvatar id="hudi" state="idle" size={96} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">{fill(st.label, { n: stage.n })}</h1>
        <p className="page-subtitle">{fill(st.lockedNote, { n: stage.n - 1 })}</p>
        <Link to="/lessons/letters" className="btn btn-primary">{st.backToStages}</Link>
      </div>
    );
  }
  if (items.length === 0 && !isAdmin() && !isPaid()) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{fill(st.introTitle, { n: stage.n, name: st.names[stage.n] })}</h1>
        <p className="page-subtitle">{copy.lockedSubtitle}</p>
        <Link to="/pricing" className="btn btn-primary">{copy.viewPricing}</Link>
      </div>
    );
  }

  const isPassed = passed.includes(stage.n);
  const done = items.filter((i) => completed.includes(i.id)).length;
  const allDone = items.length > 0 && done === items.length;
  const testOpen = allDone || isPassed || isAdmin();
  const base = `/lessons/letters/stage/${stage.n}`;
  const gameCopy = (kind) => ({
    instructions: kind === 'memory' ? t('lesson.gameInstructions_memory') : t('lesson.gameInstructions_tap'),
    allMatched: t('lesson.gameAllMatched'),
    playAgain: t('lesson.gamePlayAgain'),
  });

  const exercises = [
    { key: 'picture', icon: '🖼️', title: st.pictureTitle, desc: st.pictureDesc },
    { key: 'memory', icon: '🃏', title: st.memoryTitle, desc: st.memoryDesc },
    { key: 'name', icon: '🔤', title: st.nameTitle, desc: st.nameDesc },
  ];
  const printables = [
    { to: `${base}/print/tracing`, icon: '✏️', title: st.printTracing, desc: st.printTracingDesc },
    { to: `${base}/print/flashcards`, icon: '✂️', title: st.printFlash, desc: st.printFlashDesc },
    { to: `${base}/print/match`, icon: '🔗', title: st.printMatch, desc: st.printMatchDesc },
  ];

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <Seo title={`${fill(st.label, { n: stage.n })} | ArabiKids`} description={st.blurbs[stage.n]} path={base} />
      <Link to="/lessons/letters" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{st.back}</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <CharacterAvatar id="hudi" state="wave" size={88} />
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{fill(st.introTitle, { n: stage.n, name: st.names[stage.n] })}</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{st.blurbs[stage.n]}</p>
          {isPassed && <span className="badge badge-gold" style={{ marginTop: 8, display: 'inline-block' }}>⭐ {st.passed}</span>}
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}

      <h2 style={{ color: 'var(--color-blue)', marginTop: 28 }}>{st.lettersTitle}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14 }}>
        {items.map((it) => (
          <Link key={it.id} to={`/lessons/letters/${it.no}`} className="card card-kid" style={{ '--card-accent': stage.accent, textAlign: 'center', padding: '16px 8px' }}>
            <span className="arabic-text" dir="rtl" style={{ ...glyphStyle, fontSize: '2.6rem', display: 'block', paddingBottom: 6 }}>{it.glyph}</span>
            <span style={{ fontWeight: 800, color: 'var(--color-blue)', fontSize: '0.9rem' }}>{it.name}</span>
            {completed.includes(it.id) && (
              <span style={{ display: 'block', marginTop: 6 }}>
                <span className="badge badge-gold">⭐ {copy.done}</span>
              </span>
            )}
          </Link>
        ))}
      </div>

      <h2 style={{ color: 'var(--color-blue)', marginTop: 32 }}>{st.exercisesTitle}</h2>
      <p style={{ color: '#6b7a8a', marginTop: 0 }}>{st.exercisesHint}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        <div className="card card-kid" style={{ '--card-accent': 'var(--color-gold)' }}>
          <span style={{ fontSize: '2rem' }}>🔎</span>
          <p style={{ margin: '4px 0', fontWeight: 800, color: 'var(--color-blue)' }}>{st.testTitle}</p>
          <p style={{ margin: '0 0 10px', color: '#4b5a6a', fontSize: '0.9rem' }}>{testOpen ? st.testDesc : st.testLocked}</p>
          {testOpen ? (
            <Link to={`${base}/test`} className="btn btn-primary">{isPassed ? st.play : st.testCta}</Link>
          ) : (
            <span className="badge badge-locked">🔒 {st.lockedShort}</span>
          )}
        </div>
        {exercises.map((ex) => (
          <div key={ex.key} className="card card-kid" style={{ '--card-accent': stage.accent }}>
            <span style={{ fontSize: '2rem' }}>{ex.icon}</span>
            <p style={{ margin: '4px 0', fontWeight: 800, color: 'var(--color-blue)' }}>{ex.title}</p>
            <p style={{ margin: '0 0 10px', color: '#4b5a6a', fontSize: '0.9rem' }}>{ex.desc}</p>
            <button type="button" className="btn btn-secondary" disabled={items.length < 3} onClick={() => setGame(game === ex.key ? null : ex.key)}>
              {game === ex.key ? '✕' : st.play}
            </button>
          </div>
        ))}
      </div>

      {game && items.length >= 3 && (
        <div className="card" style={{ marginTop: 20 }} key={game}>
          {game === 'picture' && (
            <TapMatchGame
              items={items}
              copy={gameCopy('tap')}
              renderLeft={(it) => <span className="arabic-text" dir="rtl" style={glyphStyle}>{it.glyph}</span>}
              renderRight={(it) => <Picture item={it} />}
            />
          )}
          {game === 'name' && (
            <TapMatchGame
              items={items}
              copy={gameCopy('tap')}
              renderLeft={(it) => <span className="arabic-text" dir="rtl" style={glyphStyle}>{it.glyph}</span>}
              renderRight={(it) => <span style={{ fontWeight: 800, fontSize: '1rem' }}>{it.name}</span>}
            />
          )}
          {game === 'memory' && (
            <MemoryGame
              items={items}
              copy={gameCopy('memory')}
              renderWordFace={(it) => <span className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem' }}>{it.glyph}</span>}
              renderPictureFace={(it) => <Picture item={it} size={44} />}
            />
          )}
        </div>
      )}

      <h2 style={{ color: 'var(--color-blue)', marginTop: 32 }}>{st.printTitle}</h2>
      <p style={{ color: '#6b7a8a', marginTop: 0 }}>{st.printDesc}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {printables.map((p) => (
          <Link key={p.to} to={p.to} className="card card-kid" style={{ '--card-accent': 'var(--color-teal)', display: 'block' }}>
            <span style={{ fontSize: '2rem' }}>{p.icon}</span>
            <p style={{ margin: '4px 0', fontWeight: 800, color: 'var(--color-blue)' }}>{p.title}</p>
            <p style={{ margin: 0, color: '#4b5a6a', fontSize: '0.9rem' }}>{p.desc}</p>
          </Link>
        ))}
        {isPassed || isAdmin() ? (
          <Link to={`${base}/print/certificate`} className="card card-kid" style={{ '--card-accent': 'var(--color-gold)', display: 'block' }}>
            <span style={{ fontSize: '2rem' }}>🏅</span>
            <p style={{ margin: '4px 0', fontWeight: 800, color: 'var(--color-blue)' }}>{st.printCertificate}</p>
            <p style={{ margin: 0, color: '#4b5a6a', fontSize: '0.9rem' }}>{st.printCertificateDesc}</p>
          </Link>
        ) : (
          <div className="card card-kid" style={{ '--card-accent': 'var(--color-gold)', opacity: 0.65 }}>
            <span style={{ fontSize: '2rem' }}>🏅</span>
            <p style={{ margin: '4px 0', fontWeight: 800, color: 'var(--color-blue)' }}>{st.printCertificate}</p>
            <p style={{ margin: 0, color: '#4b5a6a', fontSize: '0.9rem' }}>{st.printCertificateLocked}</p>
          </div>
        )}
      </div>
      {!activeChild && <p style={{ color: '#8394a3', marginTop: 16, fontWeight: 700 }}>{st.needChild}</p>}
    </div>
  );
}
