import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { listContentIndex, getContentItems, listCompletedContentIds, listStickers } from '../lib/content.js';
import { demonstratorIds } from '../lib/characters.config.js';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import DemonstratorPicker from '../components/practical/DemonstratorPicker.jsx';
import Seo from '../components/Seo.jsx';

const ACCENTS = ['var(--color-teal)', 'var(--color-blue)', 'var(--color-purple)', 'var(--color-orange)'];
const STAGE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PracticalLifeHub() {
  const { user, isPaid, isAdmin } = useAuth();
  const { activeChild } = useActiveChild();
  const { t } = useLanguage();
  const copy = t('interactive.practical');
  const [index, setIndex] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [duaStickers, setDuaStickers] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = isAdmin() ? getContentItems() : listContentIndex();
    load
      .then((rows) => setIndex(rows.filter((r) => r.stageNo != null)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeChild) return;
    listCompletedContentIds(activeChild.id).then(setCompleted).catch(() => {});
    listStickers(activeChild.id)
      .then((s) => setDuaStickers(s.filter((x) => x.stickerId.startsWith('dua-')).length))
      .catch(() => {});
  }, [activeChild?.id]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const { demonstrator, friend } = demonstratorIds(chosen ? { demonstrator: chosen } : activeChild);
  const needsPick = activeChild && !activeChild.demonstrator && !chosen;

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <Seo title={`${copy.title} | ArabiKids`} description={copy.subtitle} path="/lessons/practical" />
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{copy.backToLessons}</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <CharacterAvatar id={demonstrator} state="wave" size={104} />
          <CharacterAvatar id={friend} state="idle" size={80} style={{ marginInlineStart: -14 }} />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{copy.title}</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{copy.subtitle}</p>
          {duaStickers > 0 && (
            <span className="badge badge-gold" style={{ display: 'inline-block', marginTop: 8 }}>
              📖 {copy.duaBook.replace('{n}', duaStickers)}
            </span>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {needsPick && (
        <div style={{ marginTop: 20 }}>
          <DemonstratorPicker copy={copy} onChosen={setChosen} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16, marginTop: 24 }}>
        {STAGE_NUMBERS.map((n, i) => {
          const stageItems = index.filter((r) => r.stageNo === n);
          const ready = stageItems.length > 0;
          const free = n === 1;
          const locked = !free && !isPaid() && !isAdmin();
          const lessonIds = stageItems.map((r) => r.id);
          const done = ready && lessonIds.some((id) => completed.includes(id));
          return (
            <Link
              key={n}
              to={locked ? (user ? '/pricing' : '/login') : `/lessons/practical/stage/${n}`}
              className="card card-kid"
              style={{ '--card-accent': ACCENTS[i % ACCENTS.length], display: 'block', opacity: locked ? 0.7 : 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{copy.stageLabel.replace('{n}', n)}</span>
                {free && <span className="badge badge-free">{copy.free}</span>}
                {locked && <span className="badge badge-locked">{copy.subscribe}</span>}
                {!locked && !free && done && <span className="badge badge-gold">⭐ {copy.done}</span>}
              </div>
              <p style={{ margin: 0, fontWeight: 800 }}>{copy.stageNames[n]}</p>
              <p style={{ margin: '6px 0 0', color: '#8ea0b6', fontSize: '0.85rem' }}>{copy.stageBlurbs[n]}</p>
              {!ready && <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#8394a3', fontWeight: 700 }}>{copy.comingSoon}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
