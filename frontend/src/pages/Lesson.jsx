import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getLessonDetail, completeLessonForChild } from '../lib/db.js';
import { badgeInfo } from '../lib/badges.js';
import HudMascot from '../components/HudMascot.jsx';
import SpeakButton from '../components/SpeakButton.jsx';

export default function Lesson() {
  const { stageId, orderIndex } = useParams();
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const [lesson, setLesson] = useState(null);
  const [locked, setLocked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setLocked(false);
    setNotFound(false);
    setCompleted(false);
    getLessonDetail(stageId, orderIndex)
      .then((data) => {
        if (data.notFound) setNotFound(true);
        else if (data.locked) setLocked(true);
        else setLesson(data.lesson);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, orderIndex]);

  async function handleMarkComplete() {
    if (!activeChild) {
      navigate('/add-child');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await completeLessonForChild({ childId: activeChild.id, lessonId: lesson.id });
      setNewBadges(result?.newBadges ?? []);
      setCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (lesson.checkpointDue) {
      navigate(`/lessons/stage/${stageId}/checkpoint/${lesson.checkpointOrder}`);
    } else {
      navigate(`/lessons/stage/${stageId}/lesson/${lesson.orderIndex + 1}`);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading lesson...</div>;

  if (notFound) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Lesson not found</h1>
        <Link to="/lessons" className="btn btn-primary">Back to Lessons</Link>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">This lesson is locked</h1>
        <p className="page-subtitle">Subscribe to unlock the full ArabiKids curriculum.</p>
        <Link to="/pricing" className="btn btn-primary">
          View Pricing
        </Link>
      </div>
    );
  }

  if (error && !lesson) return <div className="container" style={{ padding: 60 }}><p className="error-text">{error}</p></div>;
  if (!lesson) return null;

  const content = lesson.content;

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        Lesson {lesson.orderIndex}: {lesson.title}
      </h1>
      <p style={{ color: '#8ea0b6', marginTop: -8 }}>{lesson.estimatedMinutes} min · {lesson.lessonGoal}</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <span className="badge badge-free">Concept</span>
        <p style={{ fontSize: '1.1rem', marginTop: 12 }}>{content.concept}</p>
        {content.type === 'reading' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <p className="arabic-text" dir="rtl" style={{ fontSize: '1.8rem', textAlign: 'center', lineHeight: 2, margin: 0 }}>{content.passage}</p>
              <SpeakButton text={content.passage} rate={0.7} />
            </div>
            <p style={{ color: '#6b7a8a', textAlign: 'center', fontStyle: 'italic' }}>{content.translation}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <span className="badge badge-free">Arabic Word</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '16px 0 8px' }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: '2.5rem', margin: 0 }}>{lesson.arabicWord}</p>
          <SpeakButton text={lesson.arabicWord} size={22} />
        </div>
        <p style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{lesson.arabicWordMeaning}</p>
        {content.secondWord && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px 0 8px' }}>
              <p className="arabic-text" dir="rtl" style={{ fontSize: '2rem', margin: 0 }}>{content.secondWord.arabic}</p>
              <SpeakButton text={content.secondWord.arabic} size={22} />
            </div>
            <p style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{content.secondWord.translation}</p>
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 28, background: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.25)' }}>
        <span className="badge badge-locked">Quranic Connection</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 4px' }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: '1.5rem', margin: 0 }}>{content.quranicConnection?.arabic}</p>
          <SpeakButton text={content.quranicConnection?.arabic} size={18} />
        </div>
        <p style={{ margin: '0 0 8px', color: '#4b5a6a', fontStyle: 'italic' }}>"{content.quranicConnection?.translation}"</p>
        <p style={{ margin: 0, color: 'var(--color-blue-dark)', fontWeight: 700 }}>{content.quranicConnection?.reference}</p>
        {content.quranicConnection?.note && <p style={{ margin: '8px 0 0', color: '#6b7a8a' }}>{content.quranicConnection.note}</p>}
      </div>

      {error && <p className="error-text">{error}</p>}

      {!completed ? (
        <button className="btn btn-primary" disabled={submitting} onClick={handleMarkComplete}>
          {submitting ? 'Saving...' : 'Mark Complete'}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center', background: 'rgba(26,122,74,0.08)' }}>
          <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <HudMascot pose="celebrate" size={32} />
            Lesson complete!
          </h3>
          <p style={{ margin: 0 }}>
            {lesson.checkpointDue ? "Time for a quick checkpoint to review what you've learned." : 'Ready for the next lesson?'}
          </p>
          {newBadges.length > 0 && (
            <div style={{ margin: '16px 0 0' }}>
              {newBadges.map((code) => (
                <span key={code} className="badge badge-gold" style={{ margin: '0 4px' }}>
                  New Badge: {badgeInfo(code).name}
                </span>
              ))}
            </div>
          )}
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleContinue}>
            {lesson.checkpointDue ? 'Start Checkpoint →' : 'Next Lesson →'}
          </button>
        </div>
      )}
    </div>
  );
}
