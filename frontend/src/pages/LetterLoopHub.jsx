import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { listContentIndex, getContentItems, listCompletedContentIds, listStickers } from '../lib/content.js';
import { primaryGlyph } from '../lib/contentHelpers.js';
import CharacterAvatar from '../components/characters/CharacterAvatar.jsx';
import Seo from '../components/Seo.jsx';

const ACCENTS = ['var(--color-blue)', 'var(--color-teal)', 'var(--color-purple)', 'var(--color-orange)'];

export default function LetterLoopHub() {
  const { user, isPaid, isAdmin } = useAuth();
  const { activeChild } = useActiveChild();
  const { t } = useLanguage();
  const copy = t('interactive.letters');
  const [letters, setLetters] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [stickerCount, setStickerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Admins see drafts too (RLS returns them); everyone else gets the
    // approved index only - paywalled letters appear as locked cards.
    const load = isAdmin() ? getContentItems({ kind: 'letter' }) : listContentIndex('letter');
    load
      .then((rows) => setLetters(rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeChild) return;
    listCompletedContentIds(activeChild.id).then(setCompleted).catch(() => {});
    listStickers(activeChild.id).then((s) => setStickerCount(s.length)).catch(() => {});
  }, [activeChild?.id]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <Seo title={`${copy.title} | ArabiKids`} description={copy.subtitle} path="/lessons/letters" />
      <Link to="/lessons/curriculum" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToCurriculum}
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <CharacterAvatar id="hudi" state="wave" size={96} />
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{copy.title}</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{copy.subtitle}</p>
          {activeChild && stickerCount > 0 && (
            <span className="badge badge-gold" style={{ marginTop: 8, display: 'inline-block' }}>
              ⭐ {copy.stickers.replace('{n}', stickerCount)}
            </span>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {letters.length === 0 ? (
        <div className="card" style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#4b5a6a' }}>{copy.noneYet}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14, marginTop: 24 }}>
          {letters.map((l, i) => {
            const n = l.orderIndex;
            const locked = !l.isFree && !isPaid() && !isAdmin();
            const done = completed.includes(l.id);
            const draft = l.reviewStatus && l.reviewStatus !== 'approved';
            const glyph = l.data ? primaryGlyph(l.data.letter) : primaryGlyph(l.label);
            return (
              <Link
                key={l.id}
                to={locked ? '/pricing' : `/lessons/letters/${n}`}
                className="card card-kid"
                style={{
                  '--card-accent': ACCENTS[i % ACCENTS.length],
                  textAlign: 'center',
                  padding: '16px 8px',
                  opacity: locked ? 0.6 : 1,
                }}
              >
                <span className="arabic-text" dir="rtl" style={{ textAlign: 'center', fontSize: '2.6rem', lineHeight: 1.9, display: 'block', paddingBottom: 6 }}>
                  {glyph}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--color-blue)', fontSize: '0.9rem' }}>
                  {l.data?.name_say ?? l.sublabel ?? `#${n}`}
                </span>
                <span style={{ display: 'block', marginTop: 6 }}>
                  {locked && <span className="badge badge-locked">{copy.subscribe}</span>}
                  {!locked && done && <span className="badge badge-gold">⭐ {copy.done}</span>}
                  {!locked && !done && draft && <span className="badge badge-orange">{copy.draftShort}</span>}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
