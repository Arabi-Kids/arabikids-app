import { Link } from 'react-router-dom';
import HudMascot from '../components/HudMascot.jsx';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <HudMascot pose="lost" size={110} style={{ margin: '0 auto 12px' }} />
      <h1 className="page-title">404 — Page Not Found</h1>
      <p className="page-subtitle">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
