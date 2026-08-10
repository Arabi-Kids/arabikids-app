import { useEffect, useState } from 'react';
import { getStageVocabulary, getFavoriteWordIds, toggleFavoriteWord } from '../../lib/db.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import SpeakButton from '../SpeakButton.jsx';

// Pure browse/reference mode - no quiz, no scoring, just a personal word
// bank of everything taught in this stage, with an optional favorite star.
export default function MyVocabularyTab({ stageId, childId }) {
  const { language, t } = useLanguage();
  const copy = t('reviewTabs.vocabulary');
  const [words, setWords] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getStageVocabulary(stageId, language), getFavoriteWordIds(childId, stageId)])
      .then(([vocab, favIds]) => {
        setWords(vocab);
        setFavoriteIds(favIds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, childId, language]);

  async function handleToggleFavorite(lessonId) {
    const isFav = favoriteIds.includes(lessonId);
    try {
      const nowFav = await toggleFavoriteWord(childId, lessonId, isFav);
      setFavoriteIds((ids) => (nowFav ? [...ids, lessonId] : ids.filter((id) => id !== lessonId)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>{copy.loading}</p>;
  if (error) return <p className="error-text">{error}</p>;

  const visibleWords = showFavoritesOnly ? words.filter((w) => favoriteIds.includes(w.lessonId)) : words;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#8ea0b6' }}>{copy.wordsLearned.replace('{n}', words.length)}</p>
        <button type="button" className="btn btn-outline" onClick={() => setShowFavoritesOnly((v) => !v)}>
          {showFavoritesOnly ? copy.showAll : copy.favoritesOnly}
        </button>
      </div>

      {visibleWords.length === 0 ? (
        <p style={{ color: '#8ea0b6' }}>{showFavoritesOnly ? copy.noFavorites : copy.noVocabulary}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {visibleWords.map((word) => (
            <div key={word.lessonId} className="card" style={{ textAlign: 'center', padding: 14, position: 'relative' }}>
              <button
                type="button"
                onClick={() => handleToggleFavorite(word.lessonId)}
                aria-label={favoriteIds.includes(word.lessonId) ? copy.removeFavorite : copy.addFavorite}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  background: 'none',
                  border: 'none',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: favoriteIds.includes(word.lessonId) ? 'var(--color-gold)' : '#d8dce2',
                }}
              >
                ★
              </button>
              <p className="arabic-text" dir="rtl" style={{ fontSize: '1.6rem', margin: '10px 0 6px' }}>{word.arabic}</p>
              {word.transliteration && (
                <p style={{ margin: '0 0 2px', fontStyle: 'italic', color: '#8ea0b6', fontSize: '0.8rem' }}>"{word.transliteration}"</p>
              )}
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.85rem' }}>{word.meaning}</p>
              <SpeakButton text={word.arabic} size={18} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
