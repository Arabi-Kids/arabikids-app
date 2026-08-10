import { useEffect, useState } from 'react';
import { getStageVocabulary } from '../../lib/db.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LetterTraceCanvas from '../LetterTraceCanvas.jsx';
import SpeakButton from '../SpeakButton.jsx';

// Reuses the existing single-letter trace canvas unmodified in behavior -
// it never validated strokes to begin with (just a free-draw canvas with a
// faint background guide), so tracing a whole word instead of one letter
// needs no new stroke-path data, just a wider canvas + smaller guide font
// (LetterTraceCanvas's new optional width/fontScale props). Unlimited
// attempts, no gating.
export default function WriteTab({ stageId }) {
  const { language, t } = useLanguage();
  const copy = t('reviewTabs.write');
  const [words, setWords] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getStageVocabulary(stageId, language)
      .then((vocab) => {
        // Handwriting practice makes sense for single words/short phrases,
        // not a whole multi-word ayah (some Surah Corner/fluency-check
        // vocabulary entries are full verses) - cap length so the canvas
        // guide stays legible.
        setWords(vocab.filter((w) => w.arabic.length <= 20));
        setActiveIndex(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, language]);

  if (loading) return <p>{copy.loading}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (words.length === 0) return <p style={{ color: '#8ea0b6' }}>{copy.noVocabulary}</p>;

  const activeWord = words[activeIndex];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {words.map((word, i) => (
          <button
            key={word.lessonId}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={i === activeIndex ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ fontSize: '1.1rem' }}
          >
            {word.arabic}
          </button>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: 420, margin: '0 auto' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-blue)' }}>{activeWord.meaning}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <SpeakButton text={activeWord.arabic} size={20} />
        </div>
        <LetterTraceCanvas letter={activeWord.arabic} width={320} fontScale={0.32} />
      </div>
    </div>
  );
}
