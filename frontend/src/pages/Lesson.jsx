import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getLessonDetail, completeLessonForChild, getStageVocabulary, logReviewActivity } from '../lib/db.js';
import { badgeInfo } from '../lib/badges.js';
import HudMascot from '../components/HudMascot.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import LetterTraceCanvas from '../components/LetterTraceCanvas.jsx';
import LetterPositions from '../components/LetterPositions.jsx';
import PronunciationCheck from '../components/PronunciationCheck.jsx';
import PictureWordCard from '../components/PictureWordCard.jsx';
import LessonStepper from '../components/LessonStepper.jsx';
import TapMatchGame from '../components/games/TapMatchGame.jsx';
import DragMatchGame from '../components/games/DragMatchGame.jsx';
import SoundMatchGame from '../components/games/SoundMatchGame.jsx';
import MemoryGame from '../components/games/MemoryGame.jsx';
import { speakSmart } from '../lib/speech.js';
import { playTap, playCelebration } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import Confetti from '../components/Confetti.jsx';

// Small tap-to-hear letter badge used inside the embedded practice games'
// tiles - the vocabulary pool (getStageVocabulary) doesn't carry a
// content.image reference per word, so every game tile uses this same
// generic first-letter badge rather than depending on illustrations that
// don't exist yet for most words (see PictureWordCard's identical fallback
// for the lesson's own featured word).
function MiniBadge({ arabic }) {
  return (
    <div
      className="arabic-text"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--color-sky)',
        color: 'var(--color-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 6px',
        fontSize: '1.2rem',
        fontWeight: 900,
      }}
    >
      {arabic?.[0]}
    </div>
  );
}

const GAME_TYPES = ['tap', 'drag', 'sound', 'memory'];

// A tap sound plus the existing speak-the-word behavior, in one call - used
// by every tappable letter/word/example tile on this page so taps always
// feel responsive even before the (sometimes slightly delayed) speech starts.
function tapSpeak(text, opts) {
  playTap();
  speakSmart(text, opts);
}

export default function Lesson() {
  const { stageId, orderIndex } = useParams();
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const [lesson, setLesson] = useState(null);
  const [locked, setLocked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [vocabPool, setVocabPool] = useState([]);
  const [isCheering, triggerCheer] = useCelebrate();

  useEffect(() => {
    setLoading(true);
    setError('');
    setLocked(false);
    setNotFound(false);
    setCompleted(false);
    getLessonDetail(stageId, orderIndex, language)
      .then((data) => {
        if (data.notFound) setNotFound(true);
        else if (data.locked) setLocked(true);
        else setLesson(data.lesson);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, orderIndex, language]);

  // Every lesson embeds a short practice game pulled from this stage's own
  // vocabulary (getStageVocabulary - already deduped, already used by the
  // Review Hub's Play tab) - a smart default that gives all 172 lessons a
  // game with zero bespoke authoring, instead of requiring new per-lesson
  // content before "interactive across all 16 stages" can ship.
  useEffect(() => {
    getStageVocabulary(stageId, language)
      .then(setVocabPool)
      .catch(() => {});
  }, [stageId, language]);

  async function handleMarkComplete() {
    if (!activeChild) {
      navigate('/add-child');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await completeLessonForChild({ childId: activeChild.id, lessonId: lesson.id });
      setNewBadges(result?.newBadges ?? []);
      setCompleted(true);
      playCelebration();
      triggerCheer();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (lesson.checkpointDue) {
      navigate(`/lessons/stage/${stageId}/checkpoint/${lesson.checkpointOrder}`);
    } else {
      navigate(`/lessons/stage/${stageId}/lesson/${lesson.orderIndex + 1}`);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>{t('lesson.loading')}</div>;

  if (notFound) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{t('lesson.notFoundTitle')}</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">{t('lesson.backToCurriculum')}</Link>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{t('lesson.lockedTitle')}</h1>
        <p className="page-subtitle">{t('lesson.lockedSubtitle')}</p>
        <Link to="/pricing" className="btn btn-primary">
          {t('lesson.viewPricing')}
        </Link>
      </div>
    );
  }

  if (error && !lesson) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  if (!lesson) return null;

  const content = lesson.content;

  // One focused "screen" per section instead of one long scrolling page -
  // each entry below becomes its own step in <LessonStepper>, in the same
  // order these used to stack as cards. Sections only appear when the
  // lesson's content actually has that field (letters, harakat, madd, etc.),
  // exactly like the old conditional rendering.
  const steps = [];

  steps.push({
    key: 'concept',
    node: (
      <div className="card" style={{ background: 'var(--color-sky)', boxShadow: 'none', textAlign: 'center' }}>
        <span className="badge badge-free">{t('lesson.concept')}</span>
        {/* Audio-first: a 3-year-old can't read this paragraph, so the primary
            action is hearing it, not reading it - the text stays available
            underneath for parents/older kids, just visually secondary. */}
        <div>
          <button
            type="button"
            className="btn btn-secondary btn-chunky"
            style={{ margin: '14px 0 12px' }}
            onClick={() => tapSpeak(content.concept, { rate: 0.85 })}
          >
            {t('lesson.listen')}
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', margin: 0, color: '#8394a3' }}>{content.concept}</p>
        {content.type === 'reading' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', textAlign: 'center', lineHeight: 2, margin: 0 }}>{content.passage}</p>
              <SpeakButton text={content.passage} rate={0.7} />
            </div>
            <p style={{ color: '#6b7a8a', textAlign: 'center', fontStyle: 'italic' }}>{content.translation}</p>
          </div>
        )}
      </div>
    ),
  });

  if (content.letters) {
    steps.push({
      key: 'letters',
      node: (
        <div className="card">
          <span className="badge badge-gold">{t('lesson.hearLetters')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{t('lesson.tapEachLetter')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {content.letters.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(27,79,138,0.05)',
                  border: '3px solid var(--color-blue)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 0 var(--color-blue-dark)',
                  padding: '24px 12px',
                  textAlign: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => tapSpeak(item.letter, { rate: 0.6 })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                >
                  <p className="arabic-text" dir="rtl" style={{ fontSize: '3rem', margin: '0 0 6px' }}>{item.letter}</p>
                  <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-blue)', fontSize: '1.05rem' }}>{item.name}</p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#8ea0b6' }}>{t('lesson.tapToHear')}</p>
                </button>
                <LetterPositions letter={item.letter} positions={item.positions} />
                <PronunciationCheck text={item.letter} compact />
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (content.letters?.some((l) => l.harakatSet || l.harakatNote)) {
    steps.push({
      key: 'harakat',
      node: (
        <div className="card">
          <span className="badge badge-teal">{t('lesson.vowelSounds')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>
            {t('lesson.vowelSoundsIntro', { name: content.letters.find((l) => l.harakatSet)?.name ?? '' })}
          </p>
          {content.letters.filter((l) => l.harakatSet || l.harakatNote).map((l, li) => (
            <div key={li} style={{ marginBottom: li < content.letters.length - 1 ? 16 : 0 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-blue)' }}>{l.name}</p>
              {l.harakatSet && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
                  {['fatha', 'kasra', 'damma'].map((key) => {
                    const item = l.harakatSet[key];
                    return (
                      <div
                        key={key}
                        style={{
                          background: 'rgba(27,79,138,0.05)',
                          border: '2px solid var(--color-blue)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 8px',
                          textAlign: 'center',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => tapSpeak(item.arabic, { rate: 0.6 })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                        >
                          <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>{item.arabic}</p>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--color-blue)' }}>"{item.transliteration}"</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>{item.label}</p>
                        </button>
                        <PronunciationCheck text={item.arabic} compact />
                      </div>
                    );
                  })}
                </div>
              )}
              {l.harakatNote && (
                <p style={{ margin: l.harakatSet ? '10px 0 0' : 0, padding: '10px 12px', background: 'rgba(27,79,138,0.05)', borderRadius: 'var(--radius-md)', color: '#4b5a6a', fontSize: '0.9rem' }}>
                  {l.harakatNote}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  if (content.letters) {
    steps.push({
      key: 'trace',
      node: (
        <div className="card">
          <span className="badge badge-purple">{t('lesson.practiceWriting')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>
            {t('lesson.traceEachLetter')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
            {content.letters.map((item, i) => (
              <LetterTraceCanvas key={i} letter={item.letter} positions={item.positions} />
            ))}
          </div>
        </div>
      ),
    });
  }

  if (content.maddPair) {
    steps.push({
      key: 'maddPair',
      node: (
        <div className="card">
          <span className="badge badge-orange">{t('lesson.shortVsLong')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{t('lesson.tapDifference')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {['short', 'long'].map((key) => {
              const item = content.maddPair[key];
              const isLong = key === 'long';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => tapSpeak(item.arabic, { rate: 0.6 })}
                  style={{
                    background: isLong ? 'rgba(200,150,12,0.08)' : 'rgba(27,79,138,0.05)',
                    border: `2px solid ${isLong ? 'var(--color-gold)' : 'var(--color-blue)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '20px 12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <p className="arabic-text" dir="rtl" style={{ fontSize: '2rem', margin: '0 0 6px' }}>{item.arabic}</p>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-blue)' }}>"{item.transliteration}"</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8ea0b6' }}>{item.label}</p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>{t('lesson.tapToHear')}</p>
                </button>
              );
            })}
          </div>
        </div>
      ),
    });
  }

  if (content.letters?.some((l) => l.maddPair)) {
    steps.push({
      key: 'lettersMaddPair',
      node: (
        <div className="card">
          <span className="badge badge-gold">{t('lesson.shortVsLong')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{t('lesson.tapShortLongForm')}</p>
          {content.letters.filter((l) => l.maddPair).map((l, li) => (
            <div key={li} style={{ marginBottom: li < content.letters.length - 1 ? 16 : 0 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-blue)' }}>{l.name}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                {['short', 'long'].map((key) => {
                  const item = l.maddPair[key];
                  const isLong = key === 'long';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => tapSpeak(item.arabic, { rate: 0.6 })}
                      style={{
                        background: isLong ? 'rgba(200,150,12,0.08)' : 'rgba(27,79,138,0.05)',
                        border: `2px solid ${isLong ? 'var(--color-gold)' : 'var(--color-blue)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '20px 12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <p className="arabic-text" dir="rtl" style={{ fontSize: '2rem', margin: '0 0 6px' }}>{item.arabic}</p>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-blue)' }}>"{item.transliteration}"</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#8ea0b6' }}>{item.label}</p>
                      <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>{t('lesson.tapToHear')}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (content.tanweenForms) {
    steps.push({
      key: 'tanween',
      node: (
        <div className="card">
          <span className="badge badge-gold">{t('lesson.tanweenForms')}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{content.tanweenForms.intro}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
            {content.tanweenForms.forms.map((form) => (
              <button
                key={form.key}
                type="button"
                onClick={() => tapSpeak(form.arabic, { rate: 0.6 })}
                style={{
                  background: 'rgba(27,79,138,0.05)',
                  border: '2px solid var(--color-blue)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <p className="arabic-text" dir="rtl" style={{ fontSize: '1.7rem', margin: '0 0 4px' }}>{form.arabic}</p>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--color-blue)' }}>"{form.transliteration}"</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>{form.label}</p>
              </button>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (content.comparisonSet) {
    steps.push({
      key: 'comparison',
      node: (
        <div className="card">
          <span className="badge badge-teal">{t('lesson.compareBothSides')}</span>
          {content.comparisonSet.intro && <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{content.comparisonSet.intro}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {content.comparisonSet.items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => tapSpeak(item.arabic, { rate: 0.6 })}
                style={{
                  background: i === 0 ? 'rgba(27,79,138,0.05)' : 'rgba(200,150,12,0.08)',
                  border: `2px solid ${i === 0 ? 'var(--color-blue)' : 'var(--color-gold)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <p className="arabic-text" dir="rtl" style={{ fontSize: '1.7rem', margin: '0 0 4px' }}>{item.arabic}</p>
                {item.transliteration && <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--color-blue)' }}>"{item.transliteration}"</p>}
                {item.translation && <p style={{ margin: '0 0 2px', fontSize: '0.8rem', color: '#4b5a6a' }}>{item.translation}</p>}
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (content.maddTypes) {
    steps.push({
      key: 'maddTypes',
      node: (
        <div className="card">
          <span className="badge badge-gold">{t('lesson.typesOfMadd')}</span>
          {content.maddTypes.types.map((type) => (
            <div key={type.key} style={{ marginTop: 12 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-blue)' }}>
                {type.name} <span style={{ fontWeight: 400, color: '#8ea0b6' }}>· {type.countLabel}</span>
              </p>
              <p style={{ margin: '0 0 10px', color: '#4b5a6a' }}>{type.explanation}</p>
              <button
                type="button"
                onClick={() => tapSpeak(type.example.arabic, { rate: 0.6 })}
                style={{
                  background: 'rgba(200,150,12,0.08)',
                  border: '2px solid var(--color-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>{type.example.arabic}</p>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>
                  "{type.example.transliteration}" - {type.example.translation}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>{t('lesson.tapToHear')}</p>
              </button>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (content.tajweedRule) {
    steps.push({
      key: 'tajweed',
      node: (
        <div className="card">
          <span className="badge badge-gold">{t('lesson.tajweedLabel', { name: content.tajweedRule.name })}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{content.tajweedRule.kidExplanation}</p>
          <button
            type="button"
            onClick={() => tapSpeak(content.tajweedRule.example.arabic, { rate: 0.6 })}
            style={{
              background: 'rgba(27,79,138,0.05)',
              border: '2px solid var(--color-blue)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>{content.tajweedRule.example.arabic}</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>"{content.tajweedRule.example.transliteration}"</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>{t('lesson.tapToHear')}</p>
          </button>
        </div>
      ),
    });
  }

  steps.push({
    key: 'word',
    node: (
      <div>
        <PictureWordCard
          arabicWord={lesson.arabicWord}
          meaning={lesson.arabicWordMeaning}
          transliteration={content.transliteration}
          image={content.image}
          letterHighlight={content.letters?.length === 1 ? content.letters[0].letter : undefined}
        />
        {content.secondWord && (
          <PictureWordCard
            arabicWord={content.secondWord.arabic}
            meaning={content.secondWord.translation}
            transliteration={content.secondWord.transliteration}
            size="sm"
            mascot={null}
          />
        )}
      </div>
    ),
  });

  steps.push({
    key: 'pronunciation',
    node: <PronunciationCheck text={lesson.arabicWord} />,
  });

  if (vocabPool.length >= 2) {
    steps.push({
      key: 'game',
      node: (
        <div className="card">
          <span className="badge badge-teal">{t('lesson.practiceGame')}</span>
          <div style={{ marginTop: 12 }}>
            {(() => {
              const gameType = GAME_TYPES[lesson.orderIndex % GAME_TYPES.length];
              const pool = vocabPool.map((w) => ({ ...w, id: w.lessonId }));
              const onComplete = (score) => logReviewActivity(activeChild?.id, Number(stageId), 'play', score).catch(() => {});
              const gameCopy = {
                instructions: t(`lesson.gameInstructions_${gameType}`),
                allMatched: t('lesson.gameAllMatched'),
                playAgain: t('lesson.gamePlayAgain'),
                playAgainSound: t('lesson.gameReplaySound'),
              };
              if (gameType === 'tap') {
                return (
                  <TapMatchGame
                    items={pool}
                    filter={(w) => w.arabic.length <= 30}
                    copy={gameCopy}
                    renderLeft={(w) => <span className="arabic-text" dir="rtl" style={{ fontSize: '1.3rem' }}>{w.arabic}</span>}
                    renderRight={(w) => <span style={{ fontSize: '0.9rem' }}>{w.meaning}</span>}
                    onComplete={onComplete}
                  />
                );
              }
              if (gameType === 'drag') {
                return (
                  <DragMatchGame
                    items={pool}
                    filter={(w) => w.arabic.length <= 30}
                    copy={gameCopy}
                    renderChip={(w) => <span className="arabic-text" dir="rtl" style={{ fontSize: '1.2rem' }}>{w.arabic}</span>}
                    renderTarget={(w) => <span style={{ fontSize: '0.9rem' }}>{w.meaning}</span>}
                    onComplete={onComplete}
                  />
                );
              }
              if (gameType === 'sound') {
                return (
                  <SoundMatchGame
                    items={pool}
                    filter={(w) => w.arabic.length <= 30}
                    copy={gameCopy}
                    renderImage={(w) => (
                      <>
                        <MiniBadge arabic={w.arabic} />
                        <span style={{ fontSize: '0.75rem' }}>{w.meaning}</span>
                      </>
                    )}
                    onComplete={onComplete}
                  />
                );
              }
              return (
                <MemoryGame
                  items={pool}
                  filter={(w) => w.arabic.length <= 30}
                  copy={gameCopy}
                  renderWordFace={(w) => <span className="arabic-text" dir="rtl" style={{ fontSize: '1.1rem' }}>{w.arabic}</span>}
                  renderPictureFace={(w) => <MiniBadge arabic={w.arabic} />}
                  onComplete={onComplete}
                />
              );
            })()}
          </div>
        </div>
      ),
    });
  }

  steps.push({
    key: 'complete',
    node: (
      <div>
        {error && <p className="error-text">{error}</p>}
        {!completed ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="badge badge-free">{t('lesson.readyToFinish')}</span>
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-chunky" disabled={submitting} onClick={handleMarkComplete}>
                {submitting ? t('lesson.saving') : t('lesson.markComplete')}
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', background: 'rgba(26,122,74,0.08)' }}>
            <HudMascot pose="celebrate" size={72} className={isCheering ? 'mascot-cheer' : ''} style={{ margin: '0 auto 8px' }} />
            <h3 style={{ margin: '0 0 8px' }}>{t('lesson.lessonComplete')}</h3>
            <p style={{ margin: 0 }}>
              {lesson.checkpointDue ? t('lesson.checkpointDueMsg') : t('lesson.readyNextLesson')}
            </p>
            {newBadges.length > 0 && (
              <div style={{ margin: '16px 0 0' }}>
                {newBadges.map((code) => (
                  <span key={code} className="badge badge-gold" style={{ margin: '0 4px' }}>
                    {t('lesson.newBadge', { name: badgeInfo(code).name })}
                  </span>
                ))}
              </div>
            )}
            <button className="btn btn-primary btn-chunky" style={{ marginTop: 16 }} onClick={handleContinue}>
              {lesson.checkpointDue ? t('lesson.startCheckpoint') : t('lesson.nextLesson')}
            </button>
          </div>
        )}
      </div>
    ),
  });

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {t('lesson.backToStage')}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {t('lesson.lessonLabel', { n: lesson.orderIndex, title: lesson.title })}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8, marginBottom: 24 }}>{lesson.estimatedMinutes} {t('lesson.minutes')} · {lesson.lessonGoal}</p>

      <Confetti active={completed} />

      <LessonStepper key={`${stageId}-${orderIndex}`} steps={steps} />
    </div>
  );
}
