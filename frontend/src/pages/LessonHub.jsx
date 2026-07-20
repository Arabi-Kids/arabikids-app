import { Link } from 'react-router-dom';
import { PILLARS } from '../lib/pillars.js';

export default function LessonHub() {
  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Lessons Hub</h1>
      <p className="page-subtitle">Everything ArabiKids teaches, organised into tracks.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {PILLARS.map((pillar) => {
          const isLive = pillar.status === 'live';
          return (
            <Link
              key={pillar.key}
              to={isLive ? pillar.path : `/lessons/coming-soon/${pillar.key}`}
              className="card"
              style={{ display: 'block', padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '2rem' }}>{pillar.icon}</span>
                {isLive ? (
                  <span className="badge badge-free">Live</span>
                ) : (
                  <span className="badge badge-locked">Coming Soon</span>
                )}
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 800, color: 'var(--color-blue)', fontSize: '1.1rem' }}>{pillar.name}</p>
              <p style={{ margin: 0, color: '#6b7a8a' }}>{pillar.tagline}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
