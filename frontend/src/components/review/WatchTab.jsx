import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import HudMascot from '../HudMascot.jsx';

// No rebuild - the actual video player + "Continue" stage-advancement flow
// already lives at /lessons/stage/:stageId/video (StageVideo.jsx). Embedding
// that page's component here would also re-trigger its stage-advancement
// side effect, which doesn't belong in a revisit tab, so this just links out
// to the real page instead.
export default function WatchTab({ stageId }) {
  const { t } = useLanguage();
  const copy = t('reviewTabs.watch');
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <HudMascot pose="mark" size={72} style={{ margin: '0 auto 16px' }} />
      <h3 style={{ margin: '0 0 8px', color: 'var(--color-blue)' }}>{copy.title}</h3>
      <p style={{ color: '#6b7a8a', margin: '0 0 20px' }}>
        {copy.subtitle}
      </p>
      <Link to={`/lessons/stage/${stageId}/video`} className="btn btn-primary">
        {copy.watchAgain}
      </Link>
    </div>
  );
}
