import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, getStageVideoStatus, completeStageVideoForChild } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import StageRecapAnimation from '../components/StageRecapAnimation.jsx';

export default function StageVideo() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const { activeChild, refreshChildren } = useActiveChild();
  const { language, t } = useLanguage();
  const [stage, setStage] = useState(null);
  const [nextStage, setNextStage] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([getCurriculum(language), getStageVideoStatus(activeChild.id, Number(stageId))])
      .then(([{ stages }, videoStatus]) => {
        const stageRow = stages.find((s) => s.id === Number(stageId));
        setStage(stageRow);
        setNextStage(stageRow ? stages.find((s) => s.orderIndex === stageRow.orderIndex + 1) ?? null : null);
        setStatus(videoStatus);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild, language]);

  async function handleContinue() {
    setContinuing(true);
    setError('');
    try {
      await completeStageVideoForChild({ childId: activeChild.id, stageId: Number(stageId), nextStageId: nextStage?.id ?? null });
      await refreshChildren();
      navigate(nextStage ? `/lessons/stage/${nextStage.id}` : '/lessons');
    } catch (err) {
      setError(err.message);
      setContinuing(false);
    }
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>{t('stageVideo.loading')}</div>;

  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{t('stageVideo.stageNotFound')}</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">{t('stageVideo.backToCurriculum')}</Link>
      </div>
    );
  }

  if (!status?.mastered) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">{t('stageVideo.notQuiteYet')}</h1>
        <p className="page-subtitle">
          {t('stageVideo.completeMasteryFirst', { n: stage.orderIndex })}
        </p>
        <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary">{t('stageVideo.backToStageN', { n: stage.orderIndex })}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 640 }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {t('stageVideo.backToStage')}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12, textAlign: 'center' }}>
        {t('stageVideo.stageRecapTitle', { n: stage.orderIndex })}
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>{stage.name}</p>

      {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

      {status.videoUrl ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <video controls src={status.videoUrl} style={{ width: '100%', display: 'block' }} />
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <StageRecapAnimation stageId={Number(stageId)} stageName={stage.name} />
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={handleContinue} disabled={continuing}>
          {continuing
            ? t('stageVideo.saving')
            : nextStage
              ? t('stageVideo.continueToStage', { n: nextStage.orderIndex })
              : t('stageVideo.finishCompleted')}
        </button>
      </div>
    </div>
  );
}
