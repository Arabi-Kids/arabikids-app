import { useEffect, useRef, useState } from 'react';
import MusicToggle from '../components/MusicToggle.jsx';
import SongButton from '../components/SongButton.jsx';
import { letterSongUrl } from '../lib/letterSongs.js';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  getLetterBundle,
  getContentItems,
  listContentIndex,
  listSeenIntroIds,
  markIntroSeen,
  completeContentItem,
  awardSticker,
} from '../lib/content.js';
import {
  chantText, sentencePattern, firstWord, primaryGlyph, highlightClusters, vowelForms, VOWELS_FROM_LETTER, arabicWords, findLetterTexts, FIND_OK_TEXT,
} from '../lib/contentHelpers.js';
import { LETTER_PICTURE_EMOJI } from '../lib/letterPictures.js';
import { positionPicture } from '../lib/positionPictures.js';
import { characterName } from '../lib/characters.config.js';
import AnimalArt, { LETTER_ART, hasArt } from '../components/animals/AnimalArt.jsx';
import { playTap, playCelebration } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import useAudio from '../hooks/useAudio.js';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import CharacterIntro from '../components/characters/CharacterIntro.jsx';
import SpeechBubble, { useWordHighlight } from '../components/characters/SpeechBubble.jsx';
import LessonStepper from '../components/LessonStepper.jsx';
import LetterTraceCanvas from '../components/LetterTraceCanvas.jsx';
import PronunciationCheck from '../components/PronunciationCheck.jsx';
import TapMatchGame from '../components/games/TapMatchGame.jsx';
import FindLetterGame from '../components/FindLetterGame.jsx';
import Confetti from '../components/Confetti.jsx';
import Seo from '../components/Seo.jsx';

const LETTER_COUNT = 28;
const CHANT_WORD_MS = 420;

function pad(n) {
  return String(n).padStart(2, '0');
}

// "أَسَد (lion)" -> "lion" (the pack puts the English gloss in parentheses).
function gloss(cell) {
  const m = /\(([^)]+)\)/.exec(cell || '');
  return m ? m[1] : '';
}

function pickLang(row, language) {
  // The Arabic interface shows the Arabic picture word itself, not an English gloss.
  if (language === 'ar') return arabicWords(row.main_word).join(' / ');
  return language === 'ms' ? row.malay : row.english;
}

function StatusChip({ status, copy }) {
  if (!status) return null;
  return (
    <p style={{ margin: '8px 0 0', fontSize: '0.78rem', fontWeight: 700, color: '#8394a3' }}>
      {status === 'coming-soon' && copy.audioComingSoon}
      {status === 'preview' && copy.audioPreview}
      {status === 'tts-preview' && copy.audioTtsPreview}
    </p>
  );
}

// Picture for a position word: an animated drawing, an emoji, a character, or a
// soft neutral tile with the English meaning when no honest picture exists.
function PositionPicture({ pic, label }) {
  if (pic?.art && hasArt(pic.art)) return <AnimalArt name={pic.art} size={76} />;
  if (pic?.avatar) return <CharacterAvatar id={pic.avatar} state="idle" size={76} />;
  if (pic?.emoji) return <span style={{ fontSize: '3.2rem', lineHeight: 1 }} aria-hidden="true">{pic.emoji}</span>;
  return (
    <span
      style={{
        width: 76, height: 76, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(27,79,138,0.1)', color: 'var(--color-blue)', fontWeight: 800, fontSize: '0.8rem', padding: 6, textAlign: 'center',
      }}
    >
      {label}
    </span>
  );
}

function PictureTile({ letterId, label, bouncing }) {
  const emoji = LETTER_PICTURE_EMOJI[letterId];
  const isHoopoe = letterId === 'L26';
  const art = (LETTER_ART[letterId] ?? []).filter(hasArt);
  return (
    <div
      style={{
        width: 132,
        height: 132,
        margin: '0 auto',
        borderRadius: 28,
        background: 'var(--color-sky)',
        border: '3px solid var(--color-blue)',
        boxShadow: '0 4px 0 var(--color-blue-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4.2rem',
        animation: bouncing ? 'ckHop 0.6s ease-out infinite' : undefined,
      }}
      aria-label={label}
    >
      {isHoopoe ? (
        <CharacterAvatar id="hudi" state={bouncing ? 'cheer' : 'idle'} size={110} />
      ) : art.length ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {art.map((name) => <AnimalArt key={name} name={name} size={art.length > 1 ? 62 : 112} label={art.length > 1 ? name : label} />)}
        </span>
      ) : emoji ? (
        emoji
      ) : (
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-blue)', padding: 8 }}>{label}</span>
      )}
    </div>
  );
}

export default function LetterLoop() {
  const { letterNo } = useParams();
  const navigate = useNavigate();
  const { isPaid } = useAuth();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const copy = t('interactive.letters');
  const audioCopy = t('interactive.intro');
  const audio = useAudio();
  const [isCheering, triggerCheer] = useCelebrate();

  const n = Math.min(LETTER_COUNT, Math.max(1, Number(letterNo) || 1));
  const letterId = `L${pad(n)}`;

  const [bundle, setBundle] = useState(null);
  const [hostLines, setHostLines] = useState([]);
  const [seen, setSeen] = useState(false);
  const [gateItems, setGateItems] = useState([]);
  const [letterPool, setLetterPool] = useState([]);
  const [state, setState] = useState('loading'); // loading | ok | locked | notFound | error
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // chant playback
  const [chanting, setChanting] = useState(false);
  const [round, setRound] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setError('');
    setCompleted(false);
    setIntroDone(false);
    setGateItems([]);

    (async () => {
      try {
        const b = await getLetterBundle(letterId);
        if (cancelled) return;
        if (!b.letter) {
          const index = await listContentIndex('letter');
          const entry = index.find((i) => i.id === letterId);
          setState(entry && !entry.isFree && !isPaid() ? 'locked' : 'notFound');
          return;
        }
        setBundle(b);

        const lines = await getContentItems({ kind: 'host_line' });
        if (!cancelled) setHostLines(lines.filter((l) => l.data.character === 'hudi'));

        const pool = await getContentItems({ kind: 'letter' }).catch(() => []);
        if (!cancelled) {
          setLetterPool(pool.filter((p) => p.id !== letterId).map((p) => ({ id: p.id, glyph: primaryGlyph(p.data.letter) })));
        }

        if (activeChild) {
          const seenIds = await listSeenIntroIds(activeChild.id).catch(() => []);
          if (!cancelled) setSeen(seenIds.includes(`letter-${letterId}`));
        }

        if (n % 3 === 0) {
          const ids = [n - 2, n - 1, n].map((k) => `L${pad(k)}`);
          const items = await getContentItems({ ids }).catch(() => []);
          if (!cancelled) {
            setGateItems(
              items
                .filter((i) => i.kind === 'letter')
                .map((i) => ({
                  id: i.id,
                  arabic: primaryGlyph(i.data.letter),
                  meaning: firstWord(pickLang(i.data, language)),
                }))
            );
          }
        }
        if (!cancelled) setState('ok');
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setState('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [letterId, activeChild?.id, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const letter = bundle?.letter;
  const d = letter?.data;
  // The Arabic interface shows the letter's Arabic name instead of the Latin one.
  const nameShown = d ? (language === 'ar' ? d.name_ar : d.name_say) : '';
  const chantLang = ['ms', 'ar'].includes(language) ? language : 'en';
  const chant = d ? chantText(d, chantLang) : '';
  const chantWords = chant.split(/\s+/).filter(Boolean).length;
  const chantClip = audio.has(`${letterId}.chant.${chantLang}`);
  const { index: chantIndex } = useWordHighlight(chant, {
    playing: chanting,
    durationMs: chantWords * CHANT_WORD_MS,
    restartKey: round,
  });

  function hear(audioId, fallbackText) {
    playTap();
    audio.unlock();
    audio.play(audioId, { fallbackText });
  }

  function startChant() {
    playTap();
    audio.unlock();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const runRound = (r) => {
      setRound(r);
      setChanting(true);
      if (chantClip) {
        audio.play(`${letterId}.chant.${chantLang}`, {
          onEnd: () => (r < 2 ? runRound(r + 1) : setChanting(false)),
        });
      } else {
        if (r === 1) audio.play(`${letterId}.chant.${chantLang}`, { fallbackText: chant });
        timers.current.push(
          setTimeout(() => (r < 2 ? runRound(r + 1) : setChanting(false)), chantWords * CHANT_WORD_MS + 500)
        );
      }
    };
    runRound(1);
  }

  async function handleIntroDone() {
    setIntroDone(true);
    if (activeChild) markIntroSeen(activeChild.id, `letter-${letterId}`).catch(() => {});
  }

  async function handleComplete() {
    if (!activeChild) {
      navigate('/add-child');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await completeContentItem({ childId: activeChild.id, itemId: letterId });
      await awardSticker(activeChild.id, `letter-${letterId}`).catch(() => {});
      setCompleted(true);
      playCelebration();
      triggerCheer();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'loading') return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  if (state === 'locked') {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{copy.lockedTitle}</h1>
        <p className="page-subtitle">{copy.lockedSubtitle}</p>
        <Link to="/pricing" className="btn btn-primary">{copy.viewPricing}</Link>
      </div>
    );
  }

  if (state === 'notFound') {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{copy.notReadyTitle}</h1>
        <p className="page-subtitle">{copy.notReadySubtitle}</p>
        <Link to="/lessons/letters" className="btn btn-primary">{copy.backToLetters}</Link>
      </div>
    );
  }

  if (state === 'error' || !letter) {
    return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  }

  const wordAr = firstWord(d.main_word);
  const meaning = pickLang(d, language);
  const glyph = primaryGlyph(d.letter);
  const sentence = sentencePattern(d);
  const positions = bundle.positions?.data;
  const introLines = hostLines.map((l) => ({ id: l.id, text: language === 'ar' ? l.data.i18n?.ar?.text ?? l.data.arabic_optional ?? '' : pickLang(l.data, language) }));
  const isDraft = letter.reviewStatus !== 'approved';
  const voiceLang = ['ms', 'ar'].includes(language) ? language : 'en';
  const findTexts = findLetterTexts(d);

  const steps = [];

  if (introLines.length > 0) {
    steps.push({
      key: 'intro',
      node: (
        <div>
          <CharacterIntro
            characterId="hudi"
            lines={introLines}
            vars={{ letter: language === 'ar' ? d.name_ar : d.name_say, topic: language === 'ar' ? d.name_ar : d.name_say, name: characterName('hudi', language) }}
            seen={seen}
            audioIdFor={(line) => `intro.${line.id}.${letterId}.${['ms', 'ar'].includes(language) ? language : 'en'}`}
            onDone={handleIntroDone}
          />
          {introDone && (
            <p style={{ textAlign: 'center', color: 'var(--color-green)', fontWeight: 800, marginTop: 12 }}>
              {copy.introDone}
            </p>
          )}
        </div>
      ),
    });
  }

  steps.push({
    key: 'sound',
    node: (
      <div className="card" style={{ textAlign: 'center' }}>
        <span className="badge badge-gold">{copy.soundBadge}</span>
        <p style={{ margin: '10px 0 0', color: '#4b5a6a' }}>{copy.soundHelp}</p>
        <button
          type="button"
          onClick={() => hear(`${letterId}.name.ar`, d.name_ar)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px' }}
          aria-label={copy.hearName}
        >
          <span className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '7.5rem', lineHeight: 1.3, color: 'var(--color-blue)' }}>
            {glyph}
          </span>
        </button>
        <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '1.8rem', margin: '0 0 4px' }}>{d.name_ar}</p>
        <p
          className={language === 'ar' ? 'arabic-text' : undefined}
          dir={language === 'ar' ? 'rtl' : undefined}
          style={{ margin: 0, fontWeight: 800, color: 'var(--color-blue)', fontSize: language === 'ar' ? '1.8rem' : '1.2rem' }}
        >
          {language === 'ar' ? vowelForms(d.letter, d.sound_with_fatha)[0].arabic : `${nameShown} · “${d.sound_with_fatha}”`}
        </p>
        <button type="button" className="btn btn-secondary btn-chunky" style={{ marginTop: 14 }} onClick={() => hear(`${letterId}.name.ar`, d.name_ar)}>
          {copy.hearName}
        </button>
        <StatusChip status={audio.status} copy={audioCopy} />
      </div>
    ),
  });

  if (n >= VOWELS_FROM_LETTER) {
    const forms = vowelForms(d.letter, d.sound_with_fatha);
    steps.push({
      key: 'vowels',
      node: (
        <div className="card">
          <span className="badge badge-teal">{copy.vowelsBadge}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{copy.vowelsHelp.replace('{name}', nameShown)}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {forms.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => hear(`${letterId}.${v.key}.ar`, v.arabic)}
                style={{
                  background: 'rgba(27,79,138,0.05)',
                  border: '3px solid var(--color-blue)',
                  borderRadius: 20,
                  boxShadow: '0 4px 0 var(--color-blue-dark)',
                  padding: '14px 6px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <span className="arabic-text" dir="rtl" style={{ display: 'block', textAlign: 'center', fontSize: '3rem', lineHeight: 2.1, paddingBottom: 14 }}>
                  {v.arabic}
                </span>
                <span style={{ display: 'block', fontWeight: 800, color: 'var(--color-blue)' }}>“{v.say}”</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#8ea0b6', marginTop: 4 }}>{copy.tapToHear}</span>
              </button>
            ))}
          </div>
          <StatusChip status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  steps.push({
    key: 'chant',
    node: (
      <div className="card" style={{ textAlign: 'center' }}>
        <span className="badge badge-teal">{copy.chantBadge}</span>
        <div style={{ margin: '16px 0 10px' }}>
          <PictureTile letterId={letterId} label={meaning} bouncing={chanting} />
        </div>
        <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2.4rem', margin: '4px 0' }}>{wordAr}</p>
        <p style={{ margin: '0 0 14px', color: '#4b5a6a', fontWeight: 700 }}>{meaning}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <CharacterAvatar id="hudi" state={chanting ? 'talk' : 'idle'} size={84} />
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <SpeechBubble text={chant} activeIndex={chanting ? chantIndex : -1} />
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-chunky" style={{ marginTop: 14 }} disabled={chanting} onClick={startChant}>
          {chanting ? copy.chanting : copy.chantPlay}
        </button>
        {letterSongUrl(n, language) && <SongButton key={language} src={letterSongUrl(n, language)} label={copy.singAlong} stopLabel={copy.singStop} />}
        <StatusChip status={audio.status} copy={audioCopy} />
      </div>
    ),
  });

  if (positions) {
    const rows = [
      { key: 'beg', label: copy.posBeginning, cell: positions.beginning },
      { key: 'mid', label: copy.posMiddle, cell: positions.middle },
      { key: 'end', label: copy.posEnd, cell: positions.end },
    ];
    steps.push({
      key: 'positions',
      node: (
        <div className="card">
          <span className="badge badge-purple">{copy.positionsBadge}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{copy.positionsHelp}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            {rows.map((r) => {
              const word = firstWord(r.cell);
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => hear(`${bundle.positions.id}.${r.key}.ar`, word)}
                  style={{
                    background: 'rgba(27,79,138,0.05)',
                    border: '3px solid var(--color-blue)',
                    borderRadius: 20,
                    boxShadow: '0 4px 0 var(--color-blue-dark)',
                    padding: '18px 10px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 800, color: '#8ea0b6' }}>{r.label}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 84, marginBottom: 6 }}>
                    <PositionPicture pic={positionPicture(bundle.positions.id, r.key)} label={gloss(r.cell)} />
                  </div>
                  <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2.2rem', margin: '0 0 4px' }}>
                    {highlightClusters(word, d.letter).map((c, i) => (
                      <span key={i} style={c.on ? { color: 'var(--color-terracotta)' } : undefined}>{c.text}</span>
                    ))}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5a6a' }}>{gloss(r.cell)}</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#8ea0b6' }}>{copy.tapToHear}</p>
                </button>
              );
            })}
          </div>
          <StatusChip status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  if (sentence) {
    steps.push({
      key: 'sentence',
      node: (
        <div className="card" style={{ textAlign: 'center' }}>
          <span className="badge badge-orange">{copy.sentenceBadge}</span>
          <p style={{ margin: '10px 0 8px', color: '#4b5a6a' }}>{copy.sentenceHelp}</p>
          <button
            type="button"
            onClick={() => hear(`${letterId}.sentence.ar`, sentence)}
            style={{
              background: 'rgba(200,150,12,0.08)',
              border: '3px solid var(--color-gold)',
              borderRadius: 20,
              padding: '20px 24px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2.6rem' }}>{sentence}</span>
            <span style={{ display: 'block', marginTop: 8, color: '#4b5a6a', fontWeight: 700 }}>{meaning}</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: '#8ea0b6' }}>{copy.tapToHear}</span>
          </button>
          <StatusChip status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  steps.push({
    key: 'trace',
    node: (
      <div className="card" style={{ textAlign: 'center' }}>
        <span className="badge badge-purple">{copy.traceBadge}</span>
        <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{copy.traceHelp}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LetterTraceCanvas letter={glyph} />
        </div>
      </div>
    ),
  });

  steps.push({
    key: 'say',
    node: (
      <div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="badge badge-teal">{copy.sayBadge}</span>
          <p className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2.4rem', margin: '10px 0' }}>{wordAr}</p>
          <button type="button" className="btn btn-secondary btn-chunky" onClick={() => hear(`${letterId}.word.ar`, wordAr)}>
            {copy.hearWord}
          </button>
          <StatusChip status={audio.status} copy={audioCopy} />
        </div>
        <PronunciationCheck text={wordAr} showListen={false} />
      </div>
    ),
  });

  if (letterPool.length >= 3) {
    steps.push({
      key: 'find',
      node: (
        <div className="card">
          <span className="badge badge-purple">{copy.findBadge}</span>
          <div style={{ marginTop: 12 }}>
            <FindLetterGame
              target={{ id: letterId, glyph }}
              others={letterPool}
              picture={hasArt(LETTER_ART[letterId]?.[0]) ? <AnimalArt name={LETTER_ART[letterId][0]} size={92} /> : (LETTER_PICTURE_EMOJI[letterId] ?? '❔')}
              word={wordAr}
              audio={audio}
              ids={{ ask: `FIND.${letterId}.ask.${voiceLang}`, wrong: `FIND.${letterId}.wrong.${voiceLang}`, ok: `FIND.ok.${voiceLang}` }}
              text={{
                ask: findTexts.ask[voiceLang],
                wrong: findTexts.wrong[voiceLang],
                ok: FIND_OK_TEXT[voiceLang],
                hearAgain: copy.findHearAgain,
                comingSoon: audioCopy.audioComingSoon,
              }}
            />
          </div>
        </div>
      ),
    });
  }

  if (gateItems.length >= 2) {
    steps.push({
      key: 'gate',
      node: (
        <div className="card">
          <span className="badge badge-gold">{copy.gateBadge}</span>
          <div style={{ marginTop: 12 }}>
            <TapMatchGame
              items={gateItems}
              copy={{
                instructions: t('lesson.gameInstructions_tap'),
                allMatched: t('lesson.gameAllMatched'),
                playAgain: t('lesson.gamePlayAgain'),
              }}
              renderLeft={(g) => <span className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2rem' }}>{g.arabic}</span>}
              renderRight={(g) => <span style={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>{g.meaning}</span>}
            />
          </div>
        </div>
      ),
    });
  }

  const nextN = n < LETTER_COUNT ? n + 1 : null;
  steps.push({
    key: 'reward',
    node: (
      <div>
        {error && <p className="error-text">{error}</p>}
        {!completed ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <CharacterAvatar id="hudi" state="idle" size={96} style={{ margin: '0 auto 6px' }} />
            <span className="badge badge-free">{copy.readyToFinish}</span>
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-chunky" disabled={submitting} onClick={handleComplete}>
                {submitting ? copy.saving : copy.finish}
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', background: 'rgba(26,122,74,0.08)' }}>
            <CharacterAvatar id="hudi" state="cheer" size={110} style={{ margin: '0 auto 6px' }} className={isCheering ? 'mascot-cheer' : ''} />
            <h3 style={{ margin: '0 0 6px' }}>{copy.rewardTitle}</h3>
            <p style={{ margin: '0 0 6px', fontSize: '1.6rem' }}>⭐</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{copy.stickerEarned.replace('{name}', nameShown)}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              {nextN && (
                <button className="btn btn-primary btn-chunky" onClick={() => navigate(`/lessons/letters/${nextN}`)}>
                  {copy.nextLetter}
                </button>
              )}
              <Link to="/lessons/letters" className="btn btn-outline btn-chunky">{copy.backToLetters}</Link>
            </div>
          </div>
        )}
      </div>
    ),
  });

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <MusicToggle mood="play" />
      <Seo title={`${copy.title} | ArabiKids`} description={copy.subtitle} path={`/lessons/letters/${n}`} />
      <Link to="/lessons/letters" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToLetters}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {copy.letterTitle.replace('{n}', n).replace('{name}', nameShown)}
      </h1>
      {isDraft && (
        <p className="badge badge-orange" style={{ display: 'inline-block', marginBottom: 12 }}>{copy.draftBadge}</p>
      )}

      <Confetti active={completed} />
      <LessonStepper key={letterId} steps={steps} />
    </div>
  );
}
