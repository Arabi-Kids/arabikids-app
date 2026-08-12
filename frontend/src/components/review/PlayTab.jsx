import { useEffect, useState } from 'react';
import { getStageVocabulary, logReviewActivity } from '../../lib/db.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import TapMatchGame from '../games/TapMatchGame.jsx';

// Thin wrapper over the shared games/TapMatchGame engine (see
// components/games/ - extracted from this file's original matching-game
// implementation so the same engine now also powers the Arabic
// Curriculum's embedded lesson games). Pulls only this stage's own
// vocabulary, no pass/fail - just score/stars and Play Again, logged via
// review_activity.
export default function PlayTab({ stageId, childId }) {
  const { language, t } = useLanguage();
  const copy = t('reviewTabs.play');
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getStageVocabulary(stageId, language)
      .then(setPool)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, language]);

  if (loading) return <p>{copy.loading}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (pool.length < 2) return <p style={{ color: '#8ea0b6' }}>{copy.notEnoughVocab}</p>;

  return (
    <TapMatchGame
      items={pool.map((w) => ({ ...w, id: w.lessonId }))}
      filter={(w) => w.arabic.length <= 30}
      copy={{ instructions: copy.tapInstructions, allMatched: copy.allMatched, playAgain: copy.playAgain }}
      renderLeft={(w) => <span className="arabic-text" dir="rtl" style={{ fontSize: '1.3rem' }}>{w.arabic}</span>}
      renderRight={(w) => <span style={{ fontSize: '0.9rem' }}>{w.meaning}</span>}
      onComplete={(score) => logReviewActivity(childId, stageId, 'play', score).catch(() => {})}
    />
  );
}
