import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getLessonDetail, completeLessonForChild } from '../lib/db.js';
import { badgeInfo } from '../lib/badges.js';
import HudMascot from '../components/HudMascot.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import LetterTraceCanvas from '../components/LetterTraceCanvas.jsx';
import LetterPositions from '../components/LetterPositions.jsx';
import PronunciationCheck from '../components/PronunciationCheck.jsx';
import { speakSmart } from '../lib/speech.js';
import { playReciterAudio } from '../lib/quranAudio.js';
import { playTap, playCelebration } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import Confetti from '../components/Confetti.jsx';
import { VOCAB_ICONS } from '../components/VocabIcons.jsx';

// Renders the optional content.image reference picture (icon / color
// swatch / number badge) - see supabase content.image shape in db.js's
// getLessonDetail. Returns null when a lesson has no image, which is the
// large majority (only concrete, picturable words get one - no people, no
// depictions of Allah's names or sacred phrases).
function ImageBadge({ image }) {
  if (!image) return null;
  const badgeStyle = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  };
  if (image.type === 'color') {
    return <div style={{ ...badgeStyle, background: image.hex, border: '3px solid rgba(0,0,0,0.08)' }} />;
  }
  if (image.type === 'number') {
    return (
      <div style={{ ...badgeStyle, background: 'var(--color-sky)', color: 'var(--color-blue)', fontSize: '2rem', fontWeight: 900 }}>
        {image.value}
      </div>
    );
  }
  if (image.type === 'icon') {
    const Icon = VOCAB_ICONS[image.key];
    if (!Icon) return null;
    return (
      <div style={{ ...badgeStyle, background: 'var(--color-sky)', color: 'var(--color-blue)' }}>
        <Icon style={{ width: 40, height: 40 }} />
      </div>
    );
  }
  return null;
}

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
  const { language } = useLanguage();
  const [lesson, setLesson] = useState(null);
  const [locked, setLocked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [playingFluencyCheck, setPlayingFluencyCheck] = useState(false);
  const [isCheering, triggerCheer] = useCelebrate();

  // Chains every ayah's real reciter audio back-to-back via onEnd, so tapping
  // once plays the whole surah straight through - reuses the same per-ayah
  // URLs as the single-ayah "Hear a Reciter" button, no new audio needed.
  function playFluencySurah({ surahNumber, surahName, ayahs }) {
    setPlayingFluencyCheck(true);
    let i = 0;
    const playNext = () => {
      if (i >= ayahs.length) {
        setPlayingFluencyCheck(false);
        return;
      }
      const ayah = ayahs[i];
      i += 1;
      playReciterAudio({ surah: surahNumber, ayah: ayah.ayah, surahName }, { onEnd: playNext, onError: () => setPlayingFluencyCheck(false) });
    };
    playNext();
  }

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

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading lesson...</div>;

  if (notFound) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Lesson not found</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">This lesson is locked</h1>
        <p className="page-subtitle">Subscribe to unlock the full ArabiKids curriculum.</p>
        <Link to="/pricing" className="btn btn-primary">
          View Pricing
        </Link>
      </div>
    );
  }

  if (error && !lesson) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  if (!lesson) return null;

  const content = lesson.content;

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        Lesson {lesson.orderIndex}: {lesson.title}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8 }}>{lesson.estimatedMinutes} min · {lesson.lessonGoal}</p>

      <Confetti active={completed} />

      <div className="card" style={{ marginBottom: 20, background: 'var(--color-sky)', boxShadow: 'none', textAlign: 'center' }}>
        <span className="badge badge-free">Concept</span>
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
            🔊 Listen
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

      {content.letters && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">Hear the Letters</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>Tap each letter to hear how it sounds.</p>
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
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#8ea0b6' }}>🔊 Tap to hear</p>
                </button>
                <LetterPositions letter={item.letter} positions={item.positions} />
                <PronunciationCheck text={item.letter} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {content.letters?.some((l) => l.harakatSet || l.harakatNote) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-teal">Vowel Sounds</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>
            Every letter changes sound with its vowel mark - tap to hear "{content.letters.find((l) => l.harakatSet)?.name ?? ''} a / i / u".
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
      )}

      {content.letters && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-purple">Practice Writing</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>
            Trace each letter with your finger or mouse - try its Start, Middle and End shapes too.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
            {content.letters.map((item, i) => (
              <LetterTraceCanvas key={i} letter={item.letter} positions={item.positions} />
            ))}
          </div>
        </div>
      )}

      {content.maddPair && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-orange">Short vs Long</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>Tap each box to hear the difference in length.</p>
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
                  <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>🔊 Tap to hear</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {content.letters?.some((l) => l.maddPair) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">Short vs Long</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>Tap to hear the short and long form of each letter.</p>
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
                      <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>🔊 Tap to hear</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {content.tanweenForms && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">Tanween's 3 Forms</span>
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
      )}

      {content.comparisonSet && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-teal">Compare Both Sides</span>
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
      )}

      {content.maddTypes && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">Types of Madd</span>
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
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>🔊 Tap to hear</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {content.tajweedRule && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">Tajweed: {content.tajweedRule.name}</span>
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
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>🔊 Tap to hear</p>
          </button>
        </div>
      )}

      {content.surahCorner && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">🌙 Surah Corner</span>
          <p style={{ margin: '10px 0 16px', fontWeight: 700, color: 'var(--color-blue)' }}>
            {content.surahCorner.surahName} — Ayah {content.surahCorner.ayahNumber} of {content.surahCorner.totalAyahsInSurah}
          </p>
          <button
            type="button"
            onClick={() => playReciterAudio(content.quranRef)}
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
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>{content.surahCorner.arabic}</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>"{content.surahCorner.transliteration}"</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>🎧 New ayah — tap to hear a reciter</p>
          </button>
          {content.surahCorner.cumulativeAyahs.length > 1 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 700, color: 'var(--color-blue-dark)', fontSize: '0.9rem' }}>
                Recite what you've learned so far, then check yourself:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {content.surahCorner.cumulativeAyahs.slice(0, -1).map((a) => (
                  <button
                    key={a.ayah}
                    type="button"
                    onClick={() => playReciterAudio({ surah: content.surahCorner.surahNumber, ayah: a.ayah, surahName: content.surahCorner.surahName })}
                    style={{
                      background: 'rgba(27,79,138,0.05)',
                      border: '1px solid var(--color-blue)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#8ea0b6', whiteSpace: 'nowrap' }}>Ayah {a.ayah} 🎧</span>
                    <span className="arabic-text" dir="rtl" style={{ fontSize: '1.2rem' }}>{a.arabic}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {content.surahFluencyCheck && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">🌙 Fluency Check: {content.surahFluencyCheck.surahName}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>
            Try reciting all {content.surahFluencyCheck.ayahs.length} ayat of {content.surahFluencyCheck.surahName} from memory first, then
            tap below to hear a reciter go through the whole surah, start to finish.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={playingFluencyCheck}
            onClick={() => playFluencySurah(content.surahFluencyCheck)}
          >
            {playingFluencyCheck ? '🎧 Playing...' : '🎧 Play the Whole Surah'}
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <span className="badge badge-free">Arabic Word</span>
        <ImageBadge image={content.image} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '16px 0 4px' }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: '2.5rem', margin: 0 }}>{lesson.arabicWord}</p>
          <SpeakButton text={lesson.arabicWord} size={22} />
        </div>
        {content.transliteration && (
          <p style={{ margin: '0 0 4px', color: '#8ea0b6', fontStyle: 'italic', fontSize: '0.95rem' }}>
            Sounds like: "{content.transliteration}"
          </p>
        )}
        <p style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{lesson.arabicWordMeaning}</p>
        {content.secondWord && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px 0 4px' }}>
              <p className="arabic-text" dir="rtl" style={{ fontSize: '2rem', margin: 0 }}>{content.secondWord.arabic}</p>
              <SpeakButton text={content.secondWord.arabic} size={22} />
            </div>
            {content.secondWord.transliteration && (
              <p style={{ margin: '0 0 4px', color: '#8ea0b6', fontStyle: 'italic', fontSize: '0.95rem' }}>
                Sounds like: "{content.secondWord.transliteration}"
              </p>
            )}
            <p style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{content.secondWord.translation}</p>
          </>
        )}
      </div>

      <PronunciationCheck text={lesson.arabicWord} />

      <div className="card" style={{ marginBottom: 28, background: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.25)' }}>
        <span className="badge badge-locked">Quranic Connection</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 4px' }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: '1.5rem', margin: 0 }}>{content.quranicConnection?.arabic}</p>
          <SpeakButton text={content.quranicConnection?.arabic} size={18} />
        </div>
        {content.transliteration && (
          <p style={{ margin: '0 0 8px', color: '#8ea0b6', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Sounds like: "{content.transliteration}"
          </p>
        )}
        <p style={{ margin: '0 0 8px', color: '#4b5a6a', fontStyle: 'italic' }}>"{content.quranicConnection?.translation}"</p>
        <p style={{ margin: 0, color: 'var(--color-blue-dark)', fontWeight: 700 }}>{content.quranicConnection?.reference}</p>
        {content.quranicConnection?.note && <p style={{ margin: '8px 0 0', color: '#6b7a8a' }}>{content.quranicConnection.note}</p>}
        {content.quranRef && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 12 }}
            onClick={() => playReciterAudio(content.quranRef)}
          >
            🎧 Hear a Reciter ({content.quranRef.surahName} {content.quranRef.surah}:{content.quranRef.ayah})
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {!completed ? (
        <button className="btn btn-primary btn-chunky" disabled={submitting} onClick={handleMarkComplete}>
          {submitting ? 'Saving...' : 'Mark Complete'}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center', background: 'rgba(26,122,74,0.08)' }}>
          <HudMascot pose="celebrate" size={72} className={isCheering ? 'mascot-cheer' : ''} style={{ margin: '0 auto 8px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Lesson complete!</h3>
          <p style={{ margin: 0 }}>
            {lesson.checkpointDue ? "Time for a quick checkpoint to review what you've learned." : 'Ready for the next lesson?'}
          </p>
          {newBadges.length > 0 && (
            <div style={{ margin: '16px 0 0' }}>
              {newBadges.map((code) => (
                <span key={code} className="badge badge-gold" style={{ margin: '0 4px' }}>
                  New Badge: {badgeInfo(code).name}
                </span>
              ))}
            </div>
          )}
          <button className="btn btn-primary btn-chunky" style={{ marginTop: 16 }} onClick={handleContinue}>
            {lesson.checkpointDue ? 'Start Checkpoint →' : 'Next Lesson →'}
          </button>
        </div>
      )}
    </div>
  );
}
