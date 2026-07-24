import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getStageCheckpoint, getRecapGroup, getCheckpointProgress } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import LessonRecapCard from '../components/LessonRecapCard.jsx';

// Lets a child revisit a checkpoint's recap "mind map" any time after
// passing it, mirroring StageVideo.jsx's "Not quite yet" gating pattern.
export default function StageRecap() {
  const { stageId, checkpointOrder } = useParams();
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState(null);
  const [recapGroup, setRecapGroup] = useState(null);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([
      getCurriculum(),
      getStageCheckpoint(Number(stageId), Number(checkpointOrder)),
      getRecapGroup(Number(stageId), Number(checkpointOrder)),
    ])
      .then(async ([{ stages }, checkpoint, recap]) => {
        setStage(stages.find((s) => s.id === Number(stageId)));
        setRecapGroup(recap);
        if (checkpoint) {
          const progress = await getCheckpointProgress(activeChild.id, checkpoint.id);
          setPassed(progress.passed);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, checkpointOrder, activeChild]);

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading recap...</div>;
  if (error) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;

  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Stage not found</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  if (!passed) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">Not quite yet</h1>
        <p className="page-subtitle">Pass this checkpoint first to unlock its recap.</p>
        <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary">Back to Stage {stage.orderIndex}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        Recap: Stage {stage.orderIndex}, Checkpoint {checkpointOrder}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8, marginBottom: 20 }}>{stage.name}</p>
      {recapGroup ? (
        <LessonRecapCard recapGroup={recapGroup} />
      ) : (
        <p className="page-subtitle">No recap available for this checkpoint.</p>
      )}
    </div>
  );
}
