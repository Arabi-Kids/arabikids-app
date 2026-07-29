import { useEffect, useState, useCallback } from 'react';
import { getStageVocabulary, logReviewActivity } from '../../lib/db.js';
import HudMascot from '../HudMascot.jsx';

const GAME_SIZE = 6;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Matching Game v1 (per the Review Hub spec: build this first, Word Race and
// Memory Game come later). Pulls only this stage's own vocabulary, no
// pass/fail - just score/stars and Play Again, logged via review_activity.
export default function PlayTab({ stageId, childId }) {
  const [pool, setPool] = useState([]);
  const [arabicTiles, setArabicTiles] = useState([]);
  const [meaningTiles, setMeaningTiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logged, setLogged] = useState(false);

  const startRound = useCallback((words) => {
    const chosen = shuffle(words.filter((w) => w.arabic.length <= 30)).slice(0, GAME_SIZE);
    setArabicTiles(shuffle(chosen));
    setMeaningTiles(shuffle(chosen));
    setSelectedId(null);
    setMatchedIds([]);
    setWrongId(null);
    setMistakes(0);
    setLogged(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getStageVocabulary(stageId)
      .then((vocab) => {
        setPool(vocab);
        startRound(vocab);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, startRound]);

  const complete = arabicTiles.length > 0 && matchedIds.length === arabicTiles.length;

  useEffect(() => {
    if (!complete || logged) return;
    const score = Math.max(50, 100 - mistakes * 10);
    logReviewActivity(childId, stageId, 'play', score).catch(() => {});
    setLogged(true);
  }, [complete, logged, mistakes, childId, stageId]);

  function handleArabicTap(lessonId) {
    if (matchedIds.includes(lessonId)) return;
    setSelectedId(lessonId);
    setWrongId(null);
  }

  function handleMeaningTap(lessonId) {
    if (matchedIds.includes(lessonId) || selectedId === null) return;
    if (lessonId === selectedId) {
      setMatchedIds((ids) => [...ids, lessonId]);
      setSelectedId(null);
    } else {
      setWrongId(lessonId);
      setMistakes((m) => m + 1);
      setTimeout(() => setWrongId(null), 500);
      setSelectedId(null);
    }
  }

  if (loading) return <p>Loading the matching game...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (pool.length < 2) return <p style={{ color: '#8ea0b6' }}>Not enough vocabulary yet to play this game.</p>;

  const stars = Math.max(1, Math.round((Math.max(50, 100 - mistakes * 10) / 100) * 3));

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>Tap a word, then tap its meaning to match them.</p>

      {complete && (
        <div className="card" style={{ textAlign: 'center', background: 'rgba(200,150,12,0.08)', marginBottom: 16 }}>
          <HudMascot pose="celebrate" size={64} style={{ margin: '0 auto 8px' }} />
          <h3 style={{ margin: '0 0 4px' }}>All Matched!</h3>
          <p style={{ margin: '0 0 12px', fontSize: '1.4rem' }}>{'⭐'.repeat(stars)}</p>
          <button className="btn btn-primary" onClick={() => startRound(pool)}>Play Again</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {arabicTiles.map((w) => (
            <button
              key={w.lessonId}
              type="button"
              disabled={matchedIds.includes(w.lessonId)}
              onClick={() => handleArabicTap(w.lessonId)}
              className="card"
              style={{
                padding: '12px 10px',
                cursor: matchedIds.includes(w.lessonId) ? 'default' : 'pointer',
                border: `2px solid ${selectedId === w.lessonId ? 'var(--color-gold)' : 'var(--color-blue)'}`,
                background: matchedIds.includes(w.lessonId) ? 'rgba(26,122,74,0.08)' : '#fff',
                opacity: matchedIds.includes(w.lessonId) ? 0.5 : 1,
                textAlign: 'center',
              }}
            >
              <span className="arabic-text" dir="rtl" style={{ fontSize: '1.3rem' }}>{w.arabic}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meaningTiles.map((w) => (
            <button
              key={w.lessonId}
              type="button"
              disabled={matchedIds.includes(w.lessonId)}
              onClick={() => handleMeaningTap(w.lessonId)}
              className="card"
              style={{
                padding: '12px 10px',
                cursor: matchedIds.includes(w.lessonId) ? 'default' : 'pointer',
                border: `2px solid ${wrongId === w.lessonId ? '#c0392b' : 'var(--color-blue)'}`,
                background: matchedIds.includes(w.lessonId) ? 'rgba(26,122,74,0.08)' : '#fff',
                opacity: matchedIds.includes(w.lessonId) ? 0.5 : 1,
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              {w.meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
