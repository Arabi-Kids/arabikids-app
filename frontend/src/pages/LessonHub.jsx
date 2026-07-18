import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listLessonsForHub } from '../lib/db.js';

const VALID_GROUPS = ['junior', 'explorer'];

export default function LessonHub() {
  const { group } = useParams();
  const navigate = useNavigate();
  const { user, isPaid } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const validGroup = VALID_GROUPS.includes(group);

  useEffect(() => {
    if (!validGroup) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    listLessonsForHub(group, { userId: user?.id, isPaidUser: isPaid() })
      .then(setLessons)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [group, validGroup, user?.id, isPaid]);

  if (!validGroup) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Lesson track not found</h1>
        <Link to="/lessons/junior" className="btn btn-primary">Go to Junior Track</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Lesson Hub</h1>
      <p className="page-subtitle">
        {isPaid() ? 'You have full access to all 90 lessons.' : 'The first 5 lessons in each track are free. Subscribe to unlock the rest.'}
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button
          className={group === 'junior' ? 'btn btn-secondary' : 'btn btn-outline'}
          onClick={() => navigate('/lessons/junior')}
        >
          Junior (3-7)
        </button>
        <button
          className={group === 'explorer' ? 'btn btn-secondary' : 'btn btn-outline'}
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
              to={lesson.locked ? '/pricing' : `/lessons/${group}/${lesson.lessonNumber}`}
              className="card"
              style={{ display: 'block', opacity: lesson.locked ? 0.75 : 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Lesson {lesson.lessonNumber}</span>
                {lesson.locked ? (
                  <span className="badge badge-locked">🔒 Locked</span>
                ) : lesson.completed ? (
                  <span className="badge badge-gold">⭐ Done</span>
                ) : lesson.isFree ? (
                  <span className="badge badge-free">Free</span>
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
