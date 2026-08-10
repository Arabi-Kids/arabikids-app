import { useEffect, useState } from 'react';
import { getStageMasteryCheckpoint, logReviewActivity } from '../../lib/db.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ExerciseCard from '../ExerciseCard.jsx';
import HudMascot from '../HudMascot.jsx';

// Reuses the exact same checkpoint questions and ExerciseCard rendering as
// the real mastery checkpoint, but scores client-side and only logs to
// review_activity - never calls completeCheckpointForChild, so this can
// never affect child_stage_progress/child_checkpoint_progress. Unlimited
// attempts, no pass/fail consequence.
export default function PracticeTab({ stageId, childId }) {
  const { language, t } = useLanguage();
  const copy = t('reviewTabs.practice');
  const [checkpoint, setCheckpoint] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getStageMasteryCheckpoint(stageId, language)
      .then(setCheckpoint)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, language]);

  function selectAnswer(questionId, option) {
    if (result) return;
    setAnswers((a) => ({ ...a, [questionId]: option }));
  }

  async function handleSubmit() {
    const byQuestion = {};
    let correct = 0;
    for (const q of checkpoint.questions) {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) correct += 1;
      byQuestion[q.id] = { questionId: q.id, correct: isCorrect, explanation: q.explanation };
    }
    const score = Math.round((correct / checkpoint.questions.length) * 100);
    setResult({ score, byQuestion });
    try {
      await logReviewActivity(childId, stageId, 'practice', score);
    } catch {
      // Logging failure shouldn't block the child seeing their score.
    }
  }

  function handleTryAgain() {
    setAnswers({});
    setResult(null);
  }

  if (loading) return <p>{copy.loading}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!checkpoint) return <p style={{ color: '#8ea0b6' }}>{copy.noQuestions}</p>;

  const allAnswered = checkpoint.questions.every((q) => answers[q.id] !== undefined);
  const stars = result ? Math.max(1, Math.round((result.score / 100) * 3)) : 0;

  return (
    <div>
      <p style={{ color: '#8ea0b6', marginTop: 0 }}>
        {copy.practiceNote}
      </p>

      {checkpoint.questions.map((q, i) => (
        <ExerciseCard
          key={q.id}
          exercise={q}
          index={i}
          selected={answers[q.id]}
          onSelect={selectAnswer}
          result={result?.byQuestion[q.id]}
        />
      ))}

      {!result ? (
        <button className="btn btn-primary" disabled={!allAnswered} onClick={handleSubmit}>
          {copy.checkAnswers}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center', background: 'rgba(200,150,12,0.08)' }}>
          <HudMascot pose="celebrate" size={64} style={{ margin: '0 auto 8px' }} />
          <h3 style={{ margin: '0 0 4px' }}>{copy.scoreLabel.replace('{n}', result.score)}</h3>
          <p style={{ margin: '0 0 12px', fontSize: '1.4rem' }}>{'⭐'.repeat(stars)}</p>
          <button className="btn btn-primary" onClick={handleTryAgain}>{copy.tryAgain}</button>
        </div>
      )}
    </div>
  );
}
