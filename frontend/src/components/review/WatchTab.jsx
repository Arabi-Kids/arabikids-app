import { Link } from 'react-router-dom';
import HudMascot from '../HudMascot.jsx';

// No rebuild - the actual video player + "Continue" stage-advancement flow
// already lives at /lessons/stage/:stageId/video (StageVideo.jsx). Embedding
// that page's component here would also re-trigger its stage-advancement
// side effect, which doesn't belong in a revisit tab, so this just links out
// to the real page instead.
export default function WatchTab({ stageId }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <HudMascot pose="mark" size={72} style={{ margin: '0 auto 16px' }} />
      <h3 style={{ margin: '0 0 8px', color: 'var(--color-blue)' }}>Watch Your Stage Recap Again</h3>
      <p style={{ color: '#6b7a8a', margin: '0 0 20px' }}>
        Rewatch the recap video for this stage any time you like.
      </p>
      <Link to={`/lessons/stage/${stageId}/video`} className="btn btn-primary">
        ▶ Watch Again
      </Link>
    </div>
  );
}
