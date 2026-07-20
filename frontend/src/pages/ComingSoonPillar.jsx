import { Link, useParams } from 'react-router-dom';
import { getPillar } from '../lib/pillars.js';
import HudMascot from '../components/HudMascot.jsx';

export default function ComingSoonPillar() {
  const { pillarKey } = useParams();
  const pillar = getPillar(pillarKey);

  if (!pillar) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">Track not found</h1>
        <Link to="/lessons" className="btn btn-primary">Back to Lessons Hub</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 640, textAlign: 'center' }}>
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        ← Back to Lessons Hub
      </Link>
      <HudMascot pose="mark" size={80} style={{ margin: '24px auto 12px' }} />
      <span className="badge badge-locked">Coming Soon</span>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {pillar.icon} {pillar.name}
      </h1>
      <p className="page-subtitle">{pillar.tagline}</p>

      <div className="card" style={{ textAlign: 'left', marginTop: 24 }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700, color: 'var(--color-blue)' }}>What's planned:</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#4b5a6a', lineHeight: 1.8 }}>
          {pillar.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <p style={{ marginTop: 24, color: '#8ea0b6' }}>
        We're building this track next. In the meantime, dive into the Arabic & Qur'an Curriculum below.
      </p>
      <Link to="/lessons/curriculum" className="btn btn-primary" style={{ marginTop: 8 }}>
        Go to Arabic & Qur'an Curriculum
      </Link>
    </div>
  );
}
