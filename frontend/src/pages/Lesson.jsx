import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client';
import ExerciseCard from '../components/ExerciseCard.jsx';

export default function Lesson() {
  const { group, id } = useParams();
  const ageGroup = group === 'explorer' ? 'explorer' : 'junior';
  const navigate = useNavigate();
  const { token } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setLocked(false);
    setResults(null);
    setAnswers({});
    api
      .get(`/lessons/${ageGroup}/${id}`, token)
      .then((data) => {
        setLesson(data.lesson);
        setExercises(data.exercises);
      })
      .catch((err) => {
        if (err.message.includes('subscription')) setLocked(true);
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [ageGroup, id, token]);

  function selectAnswer(exerciseId, option) {
    if (results) return;
    setAnswers((a) => ({ ...a, [exerciseId]: option }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post(`/lessons/${ageGroup}/${id}/complete`, { answers }, token);
      const resultMap = Object.fromEntries(data.results.map((r) => [r.exerciseId, r]));
      setResults({ ...data, byExercise: resultMap });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading lesson...</div>;

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">This lesson is locked</h1>
        <p className="page-subtitle">Subscribe to unlock all 90 ArabiKids lessons.</p>
        <Link to="/pricing" className="btn btn-primary">
          View Pricing
        </Link>
      </div>
    );
  }

  if (error && !lesson) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  if (!lesson) return null;

  const content = lesson.content;
  const allAnswered = exercises.length > 0 && exercises.every((ex) => answers[ex.id] !== undefined);

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/${ageGroup}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to lessons
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        Lesson {lesson.lessonNumber}: {lesson.title}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8 }}>{lesson.estimatedMinutes} min · {lesson.lessonGoal}</p>

      {/* Step 1: Concept */}
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="badge badge-free">Concept</span>
        <p style={{ fontSize: '1.1rem', marginTop: 12 }}>{content.concept}</p>
        {content.type === 'reading' && (
          <div style={{ marginTop: 12 }}>
            <p className="arabic-text" style={{ fontSize: '1.8rem', textAlign: 'center', lineHeight: 2 }}>{content.passage}</p>
            <p style={{ color: '#6b7a8a', textAlign: 'center', fontStyle: 'italic' }}>{content.translation}</p>
          </div>
        )}
      </div>

      {/* Step 2: Arabic Word */}
      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <span className="badge badge-free">Arabic Word</span>
        <p className="arabic-text" style={{ fontSize: '2.5rem', margin: '16px 0 8px' }}>{lesson.arabicWord}</p>
        <p style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{lesson.arabicWordMeaning}</p>
      </div>

      {/* Step 3: Quranic Connection */}
      <div className="card" style={{ marginBottom: 28, background: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.25)' }}>
        <span className="badge badge-locked">Quranic Connection</span>
        <p className="arabic-text" style={{ fontSize: '1.5rem', margin: '14px 0 4px' }}>{content.quranicConnection?.arabic}</p>
        <p style={{ margin: '0 0 8px', color: '#4b5a6a', fontStyle: 'italic' }}>"{content.quranicConnection?.translation}"</p>
        <p style={{ margin: 0, color: 'var(--color-blue-dark)', fontWeight: 700 }}>{content.quranicConnection?.reference}</p>
        {content.quranicConnection?.note && <p style={{ margin: '8px 0 0', color: '#6b7a8a' }}>{content.quranicConnection.note}</p>}
      </div>

      {/* Step 4: Exercises */}
      {exercises.length > 0 && (
        <>
          <h2 style={{ color: 'var(--color-blue)' }}>Practice (3 Exercises)</h2>
          {exercises.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              index={i}
              selected={answers[ex.id]}
              onSelect={selectAnswer}
              result={results?.byExercise[ex.id]}
            />
          ))}

          {error && <p className="error-text">{error}</p>}

          {!results ? (
            <button className="btn btn-primary" disabled={!allAnswered || submitting} onClick={handleSubmit}>
              {submitting ? 'Checking...' : 'Submit Answers'}
            </button>
          ) : (
            <div className="card" style={{ textAlign: 'center', background: results.completed ? 'rgba(26,122,74,0.08)' : 'rgba(200,150,12,0.08)' }}>
              <h3 style={{ margin: '0 0 8px' }}>Score: {results.score}%</h3>
              <p style={{ margin: 0 }}>{results.completed ? '🎉 Great job, lesson completed!' : 'Keep practicing to reach 70%.'}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                <Link to={`/lessons/${ageGroup}`} className="btn btn-outline">
                  Back to Lesson Hub
                </Link>
                {lesson.hasNext && (
                  <button className="btn btn-primary" onClick={() => navigate(`/lessons/${ageGroup}/${lesson.lessonNumber + 1}`)}>
                    Next Lesson →
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
