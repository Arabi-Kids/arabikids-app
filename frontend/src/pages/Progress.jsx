import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getProgressSummary } from '../lib/db.js';

export default function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getProgressSummary(user.id).then(setData).catch((err) => setError(err.message));
  }, [user]);

  const pct = data ? Math.min(100, Math.round((data.totalCompleted / 90) * 100)) : 0;

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Your Progress</h1>
      <p className="page-subtitle">Track completed lessons, your streak, and recent activity.</p>

      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{data.totalCompleted}</div>
              <div className="stat-label">Lessons Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totalAttempted}</div>
              <div className="stat-label">Lessons Attempted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔥 {data.streak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>Overall completion</span>
              <span style={{ fontWeight: 700 }}>{data.totalCompleted} / 90</span>
            </div>
            <div style={{ background: '#ecebe2', borderRadius: 999, height: 14, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-gold)', borderRadius: 999 }} />
            </div>
          </div>

          <h3 style={{ color: 'var(--color-blue)' }}>Recent Lessons</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Age Group</th>
                  <th>Lesson</th>
                  <th>Score</th>
                  <th>Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((p) => (
                  <tr key={p.lessonId}>
                    <td style={{ textTransform: 'capitalize' }}>{p.ageGroup}</td>
                    <td>
                      <Link to={`/lessons/${p.ageGroup}/${p.lessonNumber}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
                        #{p.lessonNumber} {p.title}
                      </Link>
                    </td>
                    <td>{p.score}%</td>
                    <td>{p.attempts}</td>
                    <td>{p.completed ? '✅ Completed' : '⏳ In progress'}</td>
                  </tr>
                ))}
                {data.recent.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#6b7a8a' }}>
                      No lessons attempted yet. Head to the Lesson Hub to get started!
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
