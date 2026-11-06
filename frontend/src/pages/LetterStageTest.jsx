import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { awardSticker } from '../lib/content.js';
import { firstWord, findLetterTexts, FIND_OK_TEXT, shuffled } from '../lib/contentHelpers.js';
import { interpolate as fill } from '../lib/i18n/translations.js';
import { LETTER_STAGES, PASS_RATIO, letterItem, stageLetterRows, stageOpen, stageStickerId } from '../lib/letterStages.js';
import { playCelebration } from '../lib/sounds.js';
import useAudio from '../hooks/useAudio.js';
import useLetterStages from '../hooks/useLetterStages.js';
import FindLetterGame from '../components/FindLetterGame.jsx';
import AnimalArt, { hasArt } from '../components/animals/AnimalArt.jsx';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import Confetti from '../components/Confetti.jsx';
import Seo from '../components/Seo.jsx';

/** Stage test: Hudi asks for each letter of the stage (the "Find the letter" game). A letter found
 * on the first try counts. Finding at least 60% on the first try passes the stage: it earns the
 * stage sticker, opens the next stage and unlocks the printable certificate. */
export default function LetterStageTest() {
  const { stageNo } = useParams();
  const { isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const copy = t('interactive.letters');
  const st = copy.stages;
  const audioCopy = t('interactive.intro');
  const audio = useAudio();
  const { rows, passed, setPassed, loading, activeChild } = useLetterStages();
  const stage = LETTER_STAGES.find((s) => s.n === Number(stageNo));
  const [attempt, setAttempt] = useState(0);
  const [idx, setIdx] = useState(0);
  const [roundDone, setRoundDone] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [result, setResult] = useState(null); // null | { ok, n, pass }
  const [error, setError] = useState('');
  const firstTryRef = useRef(0);

  const items = useMemo(() => (stage ? stageLetterRows(rows, stage).map((r) => letterItem(r, language)) : []), [rows, stage, language]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => shuffled(items), [items, attempt]);

  if (!stage) return <Navigate to="/lessons/letters" replace />;
  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;
  if (!stageOpen(stage.n, passed, isAdmin()) || items.length < 3) return <Navigate to={`/lessons/letters/stage/${stage.n}`} replace />;

  const voiceLang = ['ms', 'ar'].includes(language) ? language : 'en';
  const base = `/lessons/letters/stage/${stage.n}`;
  const current = order[idx];
  const last = idx === order.length - 1;

  async function finish() {
    const ok = firstTryRef.current;
    const n = order.length;
    const pass = ok / n >= PASS_RATIO;
    setResult({ ok, n, pass });
    if (!pass) return;
    playCelebration();
    if (!activeChild) return;
    try {
      await awardSticker(activeChild.id, stageStickerId(stage.n));
      setPassed((p) => (p.includes(stage.n) ? p : [...p, stage.n]));
    } catch (err) {
      setError(err.message);
    }
  }

  function next() {
    if (last) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setRoundDone(false);
  }

  function retry() {
    firstTryRef.current = 0;
    setFirstTry(0);
    setIdx(0);
    setRoundDone(false);
    setResult(null);
    setAttempt((a) => a + 1);
  }

  if (result) {
    const lastStage = stage.n === LETTER_STAGES.length;
    return (
      <div className="container" style={{ padding: '48px 24px', maxWidth: 560, textAlign: 'center' }}>
        <Seo title={`${fill(st.label, { n: stage.n })} | ArabiKids`} description={st.testDesc} path={`${base}/test`} />
        <Confetti active={result.pass} />
        <CharacterAvatar id="hudi" state={result.pass ? 'cheer' : 'idle'} size={110} style={{ margin: '0 auto 8px' }} />
        <h1 className="page-title">{result.pass ? fill(st.testPassTitle, { n: stage.n }) : st.testRetryTitle}</h1>
        <p className="page-subtitle">
          {result.pass
            ? fill(lastStage ? st.testPassBodyLast : st.testPassBody, { ok: result.ok, n: result.n, next: stage.n + 1 })
            : fill(st.testRetryBody, { ok: result.ok, n: result.n })}
        </p>
        {error && <p className="error-text">{error}</p>}
        {result.pass && !activeChild && <p style={{ color: '#8394a3', fontWeight: 700 }}>{st.needChild}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          {result.pass ? (
            <>
              <Link to={`${base}/print/certificate`} className="btn btn-primary btn-chunky">🏅 {st.viewCertificate}</Link>
              <Link to="/lessons/letters" className="btn btn-outline btn-chunky">{st.backToStages}</Link>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-chunky" onClick={retry}>{st.testRetry}</button>
              <Link to={base} className="btn btn-outline btn-chunky">{st.printBack}</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const d = current.row.data;
  const findTexts = findLetterTexts(d);
  const wordAr = firstWord(d.main_word);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 640 }}>
      <Seo title={`${fill(st.label, { n: stage.n })} | ArabiKids`} description={st.testDesc} path={`${base}/test`} />
      <Link to={base} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{st.printBack}</Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>{st.testTitle}</h1>
      <p style={{ color: '#6b7a8a', fontWeight: 800, marginTop: 0 }}>{fill(st.testRound, { i: idx + 1, n: order.length })}</p>
      <div className="card">
        <FindLetterGame
          key={`${attempt}-${current.id}`}
          target={{ id: current.id, glyph: current.glyph }}
          others={items.filter((o) => o.id !== current.id).map((o) => ({ id: o.id, glyph: o.glyph }))}
          picture={hasArt(current.art) ? <AnimalArt name={current.art} size={92} /> : current.emoji}
          word={wordAr}
          audio={audio}
          ids={{ ask: `FIND.${current.id}.ask.${voiceLang}`, wrong: `FIND.${current.id}.wrong.${voiceLang}`, ok: `FIND.ok.${voiceLang}` }}
          text={{
            ask: findTexts.ask[voiceLang],
            wrong: findTexts.wrong[voiceLang],
            ok: FIND_OK_TEXT[voiceLang],
            hearAgain: copy.findHearAgain,
            comingSoon: audioCopy.audioComingSoon,
          }}
          onWin={({ mistakes }) => {
            if (mistakes === 0) {
              firstTryRef.current += 1;
              setFirstTry((n) => n + 1);
            }
            setRoundDone(true);
          }}
        />
      </div>
      {roundDone && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" className="btn btn-primary btn-chunky" onClick={next}>
            {last ? st.testFinish : st.testNext} →
          </button>
        </div>
      )}
      <p style={{ textAlign: 'center', color: '#8394a3', fontSize: '0.8rem', marginTop: 12 }}>⭐ {firstTry}</p>
    </div>
  );
}
