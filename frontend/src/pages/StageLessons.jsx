import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, listStageLessonsForChild } from '../lib/db.js';
import { StarSparkleIcon } from '../components/Icons.jsx';

export default function StageLessons() {
  const { stageId } = useParams();
  const { isPaid } = useAuth();
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    getCurriculum()
      .then(async ({ stages }) => {
        const stageRow = stages.find((s) => s.id === Number(stageId));
        setStage(stageRow);
        if (!stageRow) return;
        const currentStage = stages.find((s) => s.id === activeChild.currentStageId);
        const stageUnlocked = stageRow.orderIndex <= (currentStage?.orderIndex ?? 1);
        const list = await listStageLessonsForChild(stageRow.id, {
          childId: activeChild.id,
          isPaidUser: isPaid(),
          stageUnlocked,
        });
        setLessons(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild, isPaid]);

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;
  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Stage not found</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Link to="/lessons/curriculum" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to Curriculum
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        Stage {stage.orderIndex}: {stage.name}
      </h1>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={
              !lesson.locked
                ? `/lessons/stage/${stage.id}/lesson/${lesson.orderIndex}`
                : lesson.paywalled
                  ? '/pricing'
                  : '#'
            }
            className="card"
            onClick={(e) => {
              if (lesson.locked && !lesson.paywalled) e.preventDefault();
            }}
            style={{ display: 'block', opacity: lesson.locked ? 0.75 : 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Lesson {lesson.orderIndex}</span>
              {lesson.locked ? (
                <span className="badge badge-locked">🔒 {lesson.paywalled ? 'Subscribe' : 'Locked'}</span>
              ) : lesson.completed ? (
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <StarSparkleIcon style={{ width: 12, height: 12 }} /> Done
                </span>
              ) : lesson.isFree ? (
                <span className="badge badge-free">Free</span>
              ) : null}
            </div>
            <p style={{ margin: 0, fontWeight: 700 }}>{lesson.title}</p>
            <p style={{ margin: '6px 0 0', color: '#8ea0b6', fontSize: '0.85rem' }}>{lesson.estimatedMinutes} min</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
