import { useEffect, useState } from 'react';
import { getStageReadingPassages } from '../../lib/db.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import SpeakButton from '../SpeakButton.jsx';
import PronunciationCheck from '../PronunciationCheck.jsx';

// Guided reading practice using only words/phrases already introduced in
// this stage - tap to hear, then attempt reading it aloud. Never blocks;
// PronunciationCheck's stars are purely encouraging.
export default function ReadTab({ stageId }) {
  const { language, t } = useLanguage();
  const copy = t('reviewTabs.read');
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getStageReadingPassages(stageId, language)
      .then(setPassages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, language]);

  if (loading) return <p>{copy.loading}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (passages.length === 0) return <p style={{ color: '#8ea0b6' }}>{copy.noPassages}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {passages.map((passage, i) => (
        <div key={passage.id} className="card">
          <span className="badge badge-gold">{copy.passageLabel.replace('{n}', i + 1)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 6px' }}>
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.6rem', margin: 0, lineHeight: 1.8 }}>{passage.textContent}</p>
            <SpeakButton text={passage.textContent} size={20} rate={0.7} />
          </div>
          <p style={{ margin: '0 0 12px', color: '#6b7a8a', fontStyle: 'italic' }}>{passage.translation}</p>
          <PronunciationCheck text={passage.textContent} />
        </div>
      ))}
    </div>
  );
}
