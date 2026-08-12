import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getQuranUnits, getQuranWordConnections } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import Seo from '../components/Seo.jsx';

const QURAN_SEO = {
  title: "Qur'an & Knowledge Extras | ArabiKids",
  description: "Progressive Surah recitation, whole-surah fluency checks, and word-by-word Qur'anic connections — separate from the Arabic language curriculum.",
  path: '/lessons/quran',
};

export default function QuranPillarHub() {
  const { user, isPaid } = useAuth();
  const { language, t } = useLanguage();
  const copy = t('quranHub');
  const [surahs, setSurahs] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getQuranUnits(language), getQuranWordConnections(language)])
      .then(([{ surahs: s }, w]) => {
        setSurahs(s);
        setWords(w);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const unitLink = (unit) => {
    if (!user) return '/login';
    if (!unit.isFree && !isPaid()) return '/pricing';
    return `/lessons/quran/unit/${unit.orderIndex}`;
  };
  const unitBadge = (unit) => {
    if (!user) return copy.signIn;
    if (!unit.isFree && !isPaid()) return copy.subscribe;
    return unit.unitType === 'fluency_check' ? copy.fluencyCheckBadge : copy.newAyahBadge;
  };

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Seo {...QURAN_SEO} />
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToHub}
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <HudMascot pose="mark" size={40} />
        <h1 className="page-title" style={{ margin: 0 }}>{copy.title}</h1>
      </div>
      <p className="page-subtitle">{copy.subtitle}</p>

      {error && <p className="error-text">{error}</p>}

      {surahs.map((surah) => (
        <div key={surah.surahNumber} style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--color-blue)', marginBottom: 4 }}>
            {surah.nameArabic ? `${surah.name} — ${surah.nameArabic}` : surah.name}
          </h2>
          <p style={{ color: '#8ea0b6', marginTop: 0 }}>{t('quranHub.ayahCount', { n: surah.totalAyahs })}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {surah.units.map((unit) => (
              <Link key={unit.id} to={unitLink(unit)} className="card card-kid" style={{ '--card-accent': 'var(--color-orange)', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{unit.title}</span>
                  <span className="badge badge-gold">{unitBadge(unit)}</span>
                </div>
                <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.85rem' }}>{t('quranHub.minutes', { n: unit.estimatedMinutes })}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40 }}>
        <h2 style={{ color: 'var(--color-blue)', marginBottom: 4 }}>{copy.wordGardenTitle}</h2>
        <p style={{ color: '#8ea0b6', marginTop: 0 }}>{copy.wordGardenSubtitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {words.map((w) => (
            <div key={w.id} className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="arabic-text" dir="rtl" style={{ fontSize: '1.4rem' }}>{w.arabicCitation}</span>
                <SpeakButton text={w.arabicCitation} size={18} />
              </div>
              <p style={{ margin: '8px 0 0', fontWeight: 700, color: 'var(--color-blue)' }}>{w.translation}</p>
              <p style={{ margin: '4px 0 0', color: '#8ea0b6', fontSize: '0.8rem' }}>{w.reference}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
