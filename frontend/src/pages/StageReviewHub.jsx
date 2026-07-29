import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getStageVideoStatus, logReviewActivity } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import WatchTab from '../components/review/WatchTab.jsx';
import MyVocabularyTab from '../components/review/MyVocabularyTab.jsx';
import ReadTab from '../components/review/ReadTab.jsx';
import WriteTab from '../components/review/WriteTab.jsx';
import PracticeTab from '../components/review/PracticeTab.jsx';
import PlayTab from '../components/review/PlayTab.jsx';

const TABS = [
  { key: 'watch', label: '🎬 Watch & Learn' },
  { key: 'vocabulary', label: '📚 My Vocabulary' },
  { key: 'read', label: '📖 Read' },
  { key: 'write', label: '✍️ Write' },
  { key: 'practice', label: '📝 Practice' },
  { key: 'play', label: '🎮 Play' },
];

// A non-gating revisit space, unlocked once a stage's mastery checkpoint is
// passed - same "Not quite yet" gate as StageVideo.jsx. Nothing any tab does
// here can affect real progress: My Vocabulary/Read/Write are pure
// browse/practice, and Practice/Play log to review_activity only.
export default function StageReviewHub() {
  const { stageId } = useParams();
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState(null);
  const [mastered, setMastered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('watch');

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    setError('');
    Promise.all([getCurriculum(), getStageVideoStatus(activeChild.id, Number(stageId))])
      .then(([{ stages }, videoStatus]) => {
        setStage(stages.find((s) => s.id === Number(stageId)));
        setMastered(videoStatus.mastered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stageId, activeChild]);

  useEffect(() => {
    if (!activeChild || !mastered) return;
    logReviewActivity(activeChild.id, Number(stageId), activeTab).catch(() => {});
  }, [activeTab, activeChild, mastered, stageId]);

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  if (!stage) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Stage not found</h1>
        <Link to="/lessons/curriculum" className="btn btn-primary">Back to Curriculum</Link>
      </div>
    );
  }

  if (!mastered) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">Not quite yet</h1>
        <p className="page-subtitle">
          Complete Stage {stage.orderIndex}'s mastery checkpoint first to unlock its Review Hub.
        </p>
        <Link to={`/lessons/stage/${stageId}`} className="btn btn-primary">Back to Stage {stage.orderIndex}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Link to={`/lessons/stage/${stageId}`} style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to stage
      </Link>
      <h1 className="page-title" style={{ marginTop: 12, marginBottom: 4 }}>
        Review Hub: Stage {stage.orderIndex}
      </h1>
      <p className="page-subtitle" style={{ marginTop: 0 }}>{stage.name}</p>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 24px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'btn btn-primary' : 'btn btn-outline'}
          >
            {tab.label}
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
