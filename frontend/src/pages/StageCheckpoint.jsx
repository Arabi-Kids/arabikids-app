import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getStageCheckpoint, completeCheckpointForChild } from '../lib/db.js';
import ExerciseCard from '../components/ExerciseCard.jsx';
import HudMascot from '../components/HudMascot.jsx';
import { badgeInfo } from '../lib/badges.js';

export default function StageCheckpoint() {
  const { stageId, checkpointOrder } = useParams();
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState(null);
  const [checkpoint, setCheckpoint] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setResults(null);
    setAnswers({});
    Promise.all([getCurriculum(), getStageCheckpoint(Number(stageId), Number(checkpointOrder))])
      .then(([{ stages }, cp]) => {
        const stageRow = stages.find((s) => s.id === Number(stageId));
        setStage(stageRow);
        setCheckpoint(cp);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, checkpointOrder]);

  function selectAnswer(questionId, option) {
    if (results) return;
    setAnswers((a) => ({ ...a, [questionId]: option }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const data = await completeCheckpointForChild({ childId: activeChild.id, checkpoint, answers });
      const resultMap = Object.fromEntries(data.results.map((r) => [r.questionId, r]));
      setResults({ ...data, byQuestion: resultMap });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading checkpoint...</div>;

  if (!checkpoint || !stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Checkpoint locked</h1>
        <p className="page-subtitle">Subscribe to unlock this stage's checkpoint.</p>
        <Link to="/pricing" className="btn btn-primary">View Pricing</Link>
      </div>
    );
  }

  const allAnswered = checkpoint.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {checkpoint.isMastery ? 'Stage Mastery Checkpoint' : 'Checkpoint'}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8 }}>
        Stage {stage.orderIndex}: {stage.name}
      </p>

      {checkpoint.questions.map((q, i) => (
        <ExerciseCard
          key={q.id}
          exercise={q}
          index={i}
          selected={answers[q.id]}
          onSelect={selectAnswer}
          result={results?.byQuestion[q.id]}
        />
      ))}

      {error && <p className="error-text">{error}</p>}

      {!results ? (
        <button className="btn btn-primary" disabled={!allAnswered || submitting} onClick={handleSubmit}>
          {submitting ? 'Checking...' : 'Submit Checkpoint'}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center', background: results.passed ? 'rgba(26,122,74,0.08)' : 'rgba(200,150,12,0.08)' }}>
          <h3 style={{ margin: '0 0 8px' }}>Score: {results.score}%</h3>
          {checkpoint.isMastery ? (
            results.passed ? (
              <>
                <HudMascot pose="celebrate" size={72} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0 }}>Stage complete! Watch the recap before moving on.</p>
                {results.newBadges?.length > 0 && (
                  <div style={{ margin: '12px 0 0' }}>
                    {results.newBadges.map((code) => (
                      <span key={code} className="badge badge-gold" style={{ margin: '0 4px' }}>
                        New Badge: {badgeInfo(code).name}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => navigate(`/lessons/stage/${stageId}/video`)}>
                    Watch Stage Recap →
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: 0 }}>Keep practicing to reach 70% and unlock the next stage.</p>
                <Link to={`/lessons/stage/${stageId}`} className="btn btn-outline" style={{ marginTop: 16 }}>
                  Review This Stage
                </Link>
              </>
            )
          ) : (
            <>
              <p style={{ margin: 0 }}>{results.passed ? 'Great job so far!' : 'Keep going — you can review anytime.'}</p>
              <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary" style={{ marginTop: 16 }}>
                Continue Stage
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
