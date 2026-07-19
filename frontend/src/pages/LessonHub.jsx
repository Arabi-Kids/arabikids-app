import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum } from '../lib/db.js';

function stageState(stage, currentStageOrder, isPaidUser) {
  if (stage.orderIndex > currentStageOrder) return 'locked';
  if (!stage.isFree && !isPaidUser) return 'locked-payment';
  return 'active';
}

export default function LessonHub() {
  const { isPaid } = useAuth();
  const { activeChild, childProfiles, loading: childrenLoading } = useActiveChild();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurriculum()
      .then(({ levels: lv }) => setLevels(lv))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (childrenLoading || loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  if (childProfiles.length === 0) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Add Your First Child</h1>
        <p className="page-subtitle">Set up a child profile to start their Arabic & Quran journey.</p>
        <Link to="/add-child" className="btn btn-primary">Add Child</Link>
      </div>
    );
  }

  const currentStageOrder = levels
    .flatMap((l) => l.stages)
    .find((s) => s.id === activeChild?.currentStageId)?.orderIndex ?? 1;

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Lesson Hub</h1>
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
                    {state === 'active' && !isCurrent && <span className="badge badge-gold">⭐ Done</span>}
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
