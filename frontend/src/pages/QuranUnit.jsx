import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getQuranUnitDetail, completeQuranUnitForChild } from '../lib/db.js';
import { playReciterAudio, playFluencySurah } from '../lib/quranAudio.js';
import { playCelebration } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import HudMascot from '../components/HudMascot.jsx';
import Confetti from '../components/Confetti.jsx';

export default function QuranUnit() {
  const { orderIndex } = useParams();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const copy = t('quranUnit');
  const [unit, setUnit] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playingWhole, setPlayingWhole] = useState(false);
  const [isCheering, triggerCheer] = useCelebrate();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setLocked(false);
    setCompleted(false);
    getQuranUnitDetail(orderIndex, language)
      .then((data) => {
        if (data.notFound) setNotFound(true);
        else if (data.locked) setLocked(true);
        else {
          setUnit(data.unit);
          setAyahs(data.ayahs);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderIndex, language]);

  async function handleMarkComplete() {
    if (!activeChild) return;
    setSubmitting(true);
    setError('');
    try {
      await completeQuranUnitForChild({ childId: activeChild.id, quranUnitId: unit.id });
      setCompleted(true);
      playCelebration();
      triggerCheer();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlayWhole() {
    setPlayingWhole(true);
    playFluencySurah(
      { surahNumber: unit.surahNumber, surahName: unit.title, ayahs: ayahs.map((a) => ({ ayah: a.ayahNumber })) },
      { onEnd: () => setPlayingWhole(false), onError: () => setPlayingWhole(false) }
    );
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  if (notFound) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{copy.notFoundTitle}</h1>
        <Link to="/lessons/quran" className="btn btn-primary">{copy.backToQuran}</Link>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{copy.lockedTitle}</h1>
        <p className="page-subtitle">{copy.lockedSubtitle}</p>
        <Link to="/pricing" className="btn btn-primary">{copy.viewPricing}</Link>
      </div>
    );
  }

  if (error && !unit) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  if (!unit) return null;

  const newAyah = unit.unitType === 'surah_corner' ? ayahs[ayahs.length - 1] : null;
  const priorAyahs = unit.unitType === 'surah_corner' ? ayahs.slice(0, -1) : [];

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to="/lessons/quran" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToQuran}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>{unit.title}</h1>

      {unit.unitType === 'surah_corner' && newAyah && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">{copy.newAyahBadge}</span>
          <button
            type="button"
            onClick={() => playReciterAudio({ surah: unit.surahNumber, ayah: newAyah.ayahNumber, surahName: unit.title })}
            style={{
              background: 'rgba(200,150,12,0.08)',
              border: '2px solid var(--color-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%',
              marginTop: 10,
            }}
          >
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>{newAyah.arabic}</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>"{newAyah.transliteration}"</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#8ea0b6' }}>{copy.tapToHear}</p>
          </button>

          {priorAyahs.length > 0 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 700, color: 'var(--color-blue-dark)', fontSize: '0.9rem' }}>
                {copy.reciteWhatLearned}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {priorAyahs.map((a) => (
                  <button
                    key={a.ayahNumber}
                    type="button"
                    onClick={() => playReciterAudio({ surah: unit.surahNumber, ayah: a.ayahNumber, surahName: unit.title })}
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
                    <span style={{ fontSize: '0.75rem', color: '#8ea0b6', whiteSpace: 'nowrap' }}>{t('quranUnit.ayahLabel', { n: a.ayahNumber })}</span>
                    <span className="arabic-text" dir="rtl" style={{ fontSize: '1.2rem' }}>{a.arabic}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {unit.unitType === 'fluency_check' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="badge badge-gold">{copy.fluencyCheckBadge}</span>
          <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{t('quranUnit.fluencyCheckIntro', { n: ayahs.length })}</p>
          <button type="button" className="btn btn-primary" disabled={playingWhole} onClick={handlePlayWhole}>
            {playingWhole ? copy.playingWholeSurah : copy.playWholeSurah}
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!completed ? (
        <button className="btn btn-primary" disabled={submitting} onClick={handleMarkComplete}>
          {submitting ? copy.saving : copy.markComplete}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <Confetti active={completed} />
          <HudMascot pose="celebrate" size={72} className={isCheering ? 'mascot-cheer' : ''} style={{ margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontWeight: 700 }}>{copy.completeMsg}</p>
          <Link to="/lessons/quran" className="btn btn-outline" style={{ marginTop: 16 }}>{copy.backToQuran}</Link>
        </div>
      )}
    </div>
  );
}
