import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getStageVideoStatus, completeStageVideoForChild } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';

export default function StageVideo() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const { activeChild, refreshChildren } = useActiveChild();
  const [stage, setStage] = useState(null);
  const [nextStage, setNextStage] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([getCurriculum(), getStageVideoStatus(activeChild.id, Number(stageId))])
      .then(([{ stages }, videoStatus]) => {
        const stageRow = stages.find((s) => s.id === Number(stageId));
        setStage(stageRow);
        setNextStage(stageRow ? stages.find((s) => s.orderIndex === stageRow.orderIndex + 1) ?? null : null);
        setStatus(videoStatus);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild]);

  async function handleContinue() {
    setContinuing(true);
    setError('');
    try {
      await completeStageVideoForChild({ childId: activeChild.id, stageId: Number(stageId), nextStageId: nextStage?.id ?? null });
      await refreshChildren();
      navigate(nextStage ? `/lessons/stage/${nextStage.id}` : '/lessons');
    } catch (err) {
      setError(err.message);
      setContinuing(false);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Stage not found</h1>
        <Link to="/lessons" className="btn btn-primary">Back to Lesson Hub</Link>
      </div>
    );
  }

  if (!status?.mastered) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">Not quite yet</h1>
        <p className="page-subtitle">
          Complete Stage {stage.orderIndex}'s mastery checkpoint first to unlock its recap video.
        </p>
        <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary">Back to Stage {stage.orderIndex}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 640 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12, textAlign: 'center' }}>
        Stage {stage.orderIndex} Recap
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>{stage.name}</p>

      {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

      {status.videoUrl ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <video controls src={status.videoUrl} style={{ width: '100%', display: 'block' }} />
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', marginBottom: 24, padding: 48 }}>
          <HudMascot pose="mark" size={90} style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--color-blue)' }}>Video coming soon!</h3>
          <p style={{ color: '#6b7a8a', margin: 0 }}>
            We're producing a fun sing-along recap of everything you learned in Stage {stage.orderIndex}.
            Check back soon — for now, keep going!
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={handleContinue} disabled={continuing}>
          {continuing
            ? 'Saving...'
            : nextStage
              ? `Continue to Stage ${nextStage.orderIndex} →`
              : 'Finish — You Completed ArabiKids! →'}
        </button>
      </div>
    </div>
  );
}
