import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, getStageVideoStatus, logReviewActivity } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import WatchTab from '../components/review/WatchTab.jsx';
import MyVocabularyTab from '../components/review/MyVocabularyTab.jsx';
import ReadTab from '../components/review/ReadTab.jsx';
import WriteTab from '../components/review/WriteTab.jsx';
import PracticeTab from '../components/review/PracticeTab.jsx';
import PlayTab from '../components/review/PlayTab.jsx';

const TAB_KEYS = ['watch', 'vocabulary', 'read', 'write', 'practice', 'play'];

// A non-gating revisit space, unlocked once a stage's mastery checkpoint is
// passed - same "Not quite yet" gate as StageVideo.jsx. Nothing any tab does
// here can affect real progress: My Vocabulary/Read/Write are pure
// browse/practice, and Practice/Play log to review_activity only.
export default function StageReviewHub() {
  const { stageId } = useParams();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const [stage, setStage] = useState(null);
  const [mastered, setMastered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('watch');

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([getCurriculum(language), getStageVideoStatus(activeChild.id, Number(stageId))])
      .then(([{ stages }, videoStatus]) => {
        setStage(stages.find((s) => s.id === Number(stageId)));
        setMastered(videoStatus.mastered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild, language]);

  useEffect(() => {
    if (!activeChild || !mastered) return;
    logReviewActivity(activeChild.id, Number(stageId), activeTab).catch(() => {});
  }, [activeTab, activeChild, mastered, stageId]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{t('stageReviewHub.loading')}</div>;

  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{t('stageReviewHub.stageNotFound')}</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">{t('stageReviewHub.backToCurriculum')}</Link>
      </div>
    );
  }

  if (!mastered) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">{t('stageReviewHub.notQuiteYet')}</h1>
        <p className="page-subtitle">
          {t('stageReviewHub.completeMasteryFirst', { n: stage.orderIndex })}
        </p>
        <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary">{t('stageReviewHub.backToStageN', { n: stage.orderIndex })}</Link>
      </div>
    );
  }

  const tabs = t('stageReviewHub.tabs');

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {t('stageReviewHub.backToStage')}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12, marginBottom: 4 }}>
        {t('stageReviewHub.reviewHubTitle', { n: stage.orderIndex })}
      </h1>
      <p className="page-subtitle" style={{ marginTop: 0 }}>{stage.name}</p>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 24px' }}>
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? 'btn btn-primary' : 'btn btn-outline'}
          >
            {tabs[key]}
          </button>
        ))}
      </div>

      {activeTab === 'watch' && <WatchTab stageId={Number(stageId)} />}
      {activeTab === 'vocabulary' && <MyVocabularyTab stageId={Number(stageId)} childId={activeChild.id} />}
      {activeTab === 'read' && <ReadTab stageId={Number(stageId)} />}
      {activeTab === 'write' && <WriteTab stageId={Number(stageId)} />}
      {activeTab === 'practice' && <PracticeTab stageId={Number(stageId)} childId={activeChild.id} />}
      {activeTab === 'play' && <PlayTab stageId={Number(stageId)} childId={activeChild.id} />}
    </div>
  );
}
