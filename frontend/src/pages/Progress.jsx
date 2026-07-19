import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getChildProgressSummary } from '../lib/db.js';

const TOTAL_STAGES = 16;

export default function Progress() {
  const { activeChild, childProfiles, loading: childrenLoading } = useActiveChild();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    getChildProgressSummary(activeChild.id).then(setData).catch((err) => setError(err.message));
  }, [activeChild]);

  if (childrenLoading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  if (childProfiles.length === 0) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">No Child Yet</h1>
        <Link to="/add-child" className="btn btn-primary">Add a Child</Link>
      </div>
    );
  }

  const pct = data ? Math.min(100, Math.round((data.stagesCompleted / TOTAL_STAGES) * 100)) : 0;

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">{activeChild?.name}'s Progress</h1>
      <p className="page-subtitle">Track completed lessons, stages, streak, and recent activity.</p>

      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{data.totalLessonsCompleted}</div>
              <div className="stat-label">Lessons Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.stagesCompleted} / {TOTAL_STAGES}</div>
              <div className="stat-label">Stages Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔥 {data.streak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>Curriculum progress</span>
              <span style={{ fontWeight: 700 }}>{data.stagesCompleted} / {TOTAL_STAGES} stages</span>
            </div>
            <div style={{ background: '#ecebe2', borderRadius: 999, height: 14, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-gold)', borderRadius: 999 }} />
            </div>
          </div>

          <h3 style={{ color: 'var(--color-blue)' }}>Recently Completed Lessons</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Lesson</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.lessonId}>
                    <td>{r.stageName}</td>
                    <td>#{r.lessonOrderIndex} {r.title}</td>
                  </tr>
                ))}
                {data.recent.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: '#6b7a8a' }}>
                      No lessons completed yet. Head to the Lesson Hub to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
