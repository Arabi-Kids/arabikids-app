import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, listMasteredStageIds } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import { StarSparkleIcon } from '../components/Icons.jsx';

function stageState(stage, currentStageOrder, isPaidUser) {
  if (stage.orderIndex > currentStageOrder) return 'locked';
  if (!stage.isFree && !isPaidUser) return 'locked-payment';
  return 'active';
}

export default function ArabicCurriculumHub() {
  const { isPaid } = useAuth();
  const { activeChild, childProfiles, loading: childrenLoading } = useActiveChild();
  const [levels, setLevels] = useState([]);
  const [masteredStageIds, setMasteredStageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    Promise.all([getCurriculum(), listMasteredStageIds(activeChild.id)])
      .then(([{ levels: lv }, mastered]) => {
        setLevels(lv);
        setMasteredStageIds(mastered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeChild]);

  if (childrenLoading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  if (childProfiles.length === 0) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">Add Your First Child</h1>
        <p className="page-subtitle">Set up a child profile to start their Arabic & Quran journey.</p>
        <Link to="/add-child" className="btn btn-primary">Add Child</Link>
      </div>
    );
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  const currentStageOrder = levels
    .flatMap((l) => l.stages)
    .find((s) => s.id === activeChild?.currentStageId)?.orderIndex ?? 1;

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to Lessons Hub
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>Arabic & Qur'an Curriculum</h1>
      <p className="page-subtitle">
        {activeChild?.name}'s journey — {isPaid() ? 'full access to all 16 stages.' : 'Stage 1 is free. Subscribe to unlock the rest.'}
      </p>

      {error && <p className="error-text">{error}</p>}

      {levels.map((level) => (
        <div key={level.id} style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--color-blue)', marginBottom: 4 }}>{level.name}</h2>
          <p style={{ color: '#8ea0b6', marginTop: 0 }}>{level.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {level.stages.map((stage) => {
              const state = stageState(stage, currentStageOrder, isPaid());
              const isCurrent = stage.orderIndex === currentStageOrder;
              const isMastered = masteredStageIds.includes(stage.id);
              return (
                <Link
                  key={stage.id}
                  to={state === 'locked-payment' ? '/pricing' : state === 'locked' ? '#' : `/lessons/stage/${stage.id}`}
                  className="card"
                  onClick={(e) => state === 'locked' && e.preventDefault()}
                  style={{ display: 'block', opacity: state === 'locked' ? 0.6 : 1, cursor: state === 'locked' ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Stage {stage.orderIndex}</span>
                    {state === 'locked' && <span className="badge badge-locked">🔒 Locked</span>}
                    {state === 'locked-payment' && <span className="badge badge-locked">🔒 Subscribe</span>}
                    {state === 'active' && isCurrent && <span className="badge badge-free">In Progress</span>}
                    {state === 'active' && !isCurrent && isMastered && (
                      <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <StarSparkleIcon style={{ width: 12, height: 12 }} /> Done
                      </span>
                    )}
                    {/* Below the child's current stage but never actually completed —
                        possible when the placement test starts them ahead of Stage 1. */}
                    {state === 'active' && !isCurrent && !isMastered && (
                      <span className="badge badge-locked">Not Started</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{stage.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
