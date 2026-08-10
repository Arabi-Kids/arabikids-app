import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, listStageLessonsForChild, listMasteredStageIds } from '../lib/db.js';
import { StarSparkleIcon } from '../components/Icons.jsx';
import HudMascot from '../components/HudMascot.jsx';

// Same 4-color cycle as ArabicCurriculumHub's level sections, keyed off this
// stage's own level (4 stages per level) so a lesson list visually matches
// the color of the level it belongs to.
const LEVEL_ACCENTS = ['var(--color-blue)', 'var(--color-teal)', 'var(--color-purple)', 'var(--color-orange)'];

export default function StageLessons() {
  const { stageId } = useParams();
  const { isPaid } = useAuth();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const [stage, setStage] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [mastered, setMastered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    getCurriculum(language)
      .then(async ({ stages }) => {
        const stageRow = stages.find((s) => s.id === Number(stageId));
        setStage(stageRow);
        if (!stageRow) return;
        const currentStage = stages.find((s) => s.id === activeChild.currentStageId);
        const stageUnlocked = stageRow.orderIndex <= (currentStage?.orderIndex ?? 1);
        const [list, masteredIds] = await Promise.all([
          listStageLessonsForChild(stageRow.id, {
            childId: activeChild.id,
            isPaidUser: isPaid(),
            stageUnlocked,
            language,
          }),
          listMasteredStageIds(activeChild.id),
        ]);
        setLessons(list);
        setMastered(masteredIds.includes(stageRow.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild, isPaid, language]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{t('stageLessons.loading')}</div>;
  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{t('stageLessons.stageNotFound')}</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">{t('stageLessons.backToCurriculum')}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Link to="/lessons/curriculum" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {t('stageLessons.backToCurriculumTop')}
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <HudMascot pose="mark" size={40} />
        <h1 className="page-title" style={{ margin: 0 }}>
          {t('stageLessons.stageLabel', { n: stage.orderIndex, name: stage.name })}
        </h1>
      </div>
      {stage.introKids && <p style={{ margin: '6px 0 20px', color: '#4b5a6a', fontSize: '1.05rem' }}>{stage.introKids}</p>}

      <Link
        to={`/lessons/stage/${stage.id}/review`}
        className={mastered ? 'badge badge-gold' : 'badge badge-locked'}
        style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
      >
        {mastered ? t('stageLessons.reviewThisStage') : t('stageLessons.reviewHub')}
      </Link>

      {error && <p className="error-text">{error}</p>}

      {lessons.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 20px' }}>
          {Array.from({ length: Math.ceil(lessons.length / 3) }, (_, i) => i + 1).map((checkpointOrder) => (
            <Link
              key={checkpointOrder}
              to={`/lessons/stage/${stage.id}/recap/${checkpointOrder}`}
              className="badge badge-gold"
              style={{ textDecoration: 'none' }}
            >
              {t('stageLessons.recapLabel', { n: checkpointOrder })}
            </Link>
          ))}
        </div>
      )}

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
            className="card card-kid"
            onClick={(e) => {
              if (lesson.locked && !lesson.paywalled) e.preventDefault();
            }}
            style={{
              '--card-accent': LEVEL_ACCENTS[Math.floor((stage.orderIndex - 1) / 4) % LEVEL_ACCENTS.length],
              display: 'block',
              opacity: lesson.locked ? 0.75 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{t('stageLessons.lessonLabel', { n: lesson.orderIndex })}</span>
              {lesson.locked ? (
                <span className="badge badge-locked">🔒 {lesson.paywalled ? t('stageLessons.subscribe') : t('stageLessons.locked')}</span>
              ) : lesson.completed ? (
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <StarSparkleIcon style={{ width: 12, height: 12 }} /> {t('stageLessons.done')}
                </span>
              ) : lesson.isFree ? (
                <span className="badge badge-free">{t('stageLessons.free')}</span>
              ) : null}
            </div>
            <p style={{ margin: 0, fontWeight: 700 }}>{lesson.title}</p>
            <p style={{ margin: '6px 0 0', color: '#8ea0b6', fontSize: '0.85rem' }}>{lesson.estimatedMinutes} {t('stageLessons.minutes')}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
