import { Link, useParams } from 'react-router-dom';
import { getPillar } from '../lib/pillars.js';
import HudMascot from '../components/HudMascot.jsx';
import ZaydMascot from '../components/ZaydMascot.jsx';
import AmalMascot from '../components/AmalMascot.jsx';

// Per spec section 11's design direction: the boy/girl character set is used
// specifically for Pillar 2 (Islamic Practical Life) and Pillar 3 (Character
// & Stories) previews - Pillar 4 and the not-found state keep Hud, ArabiKids'
// main recurring guide.
const PILLAR_MASCOTS = new Set(['practical-life', 'character-stories']);

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
      {PILLAR_MASCOTS.has(pillar.key) ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '24px auto 12px' }}>
          <ZaydMascot pose="hero" size={76} />
          <AmalMascot pose="hero" size={76} />
        </div>
      ) : (
        <HudMascot pose="mark" size={80} style={{ margin: '24px auto 12px' }} />
      )}
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
