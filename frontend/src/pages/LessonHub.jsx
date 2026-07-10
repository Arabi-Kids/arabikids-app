import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client';

export default function LessonHub() {
  const { group } = useParams();
  const ageGroup = group === 'explorer' ? 'explorer' : 'junior';
  const navigate = useNavigate();
  const { token, isPaid } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/lessons/${ageGroup}`, token)
      .then((data) => setLessons(data.lessons))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ageGroup, token]);

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Lesson Hub</h1>
      <p className="page-subtitle">
        {isPaid() ? 'You have full access to all 90 lessons.' : 'The first 5 lessons in each track are free. Subscribe to unlock the rest.'}
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button
          className={ageGroup === 'junior' ? 'btn btn-secondary' : 'btn btn-outline'}
          onClick={() => navigate('/lessons/junior')}
        >
          Junior (3-7)
        </button>
        <button
          className={ageGroup === 'explorer' ? 'btn btn-secondary' : 'btn btn-outline'}
          onClick={() => navigate('/lessons/explorer')}
        >
          Explorer (8-17)
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading lessons...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={lesson.locked ? '/pricing' : `/lessons/${ageGroup}/${lesson.lessonNumber}`}
              className="card"
              style={{ display: 'block', opacity: lesson.locked ? 0.75 : 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Lesson {lesson.lessonNumber}</span>
                {lesson.locked ? (
                  <span className="badge badge-locked">🔒 Locked</span>
                ) : lesson.isFree ? (
                  <span className="badge badge-free">Free</span>
                ) : lesson.completed ? (
                  <span className="badge badge-free">✓ Done</span>
                ) : null}
              </div>
              <p style={{ margin: 0, fontWeight: 700 }}>{lesson.title}</p>
              <p style={{ margin: '6px 0 0', color: '#8ea0b6', fontSize: '0.85rem' }}>{lesson.estimatedMinutes} min</p>
              {lesson.completed && <p style={{ margin: '8px 0 0', color: '#6b7a8a' }}>Score: {lesson.score}%</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
