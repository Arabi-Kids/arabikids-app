import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, getChildProgressSummary } from '../lib/db.js';
import { badgeInfo } from '../lib/badges.js';
import { PILLARS } from '../lib/pillars.js';
import HudMascot from '../components/HudMascot.jsx';

export default function LessonHub() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const [currentStage, setCurrentStage] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!activeChild) {
      setCurrentStage(null);
      setProgress(null);
      return;
    }
    Promise.all([getCurriculum(), getChildProgressSummary(activeChild.id)])
      .then(([{ levels }, summary]) => {
        const stage = levels.flatMap((l) => l.stages).find((s) => s.id === activeChild.currentStageId);
        setCurrentStage(stage ?? null);
        setProgress(summary);
      })
      .catch(() => {});
  }, [activeChild]);

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <h1 className="page-title">Lessons Hub</h1>
      <p className="page-subtitle">Everything ArabiKids teaches, organised into tracks.</p>

      {user && activeChild && currentStage && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <HudMascot pose="mark" size={56} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 800, color: 'var(--color-blue)' }}>
              {activeChild.name} is on Stage {currentStage.orderIndex}: {currentStage.name}
            </p>
            {progress && (
              <p style={{ margin: 0, color: '#6b7a8a', fontSize: '0.9rem' }}>
                {progress.streak > 0 && <>🔥 {progress.streak}-day streak · </>}
                {progress.badges.length} badge{progress.badges.length === 1 ? '' : 's'} earned
                {progress.badges.length > 0 && <> ({badgeInfo(progress.badges[0]).name}{progress.badges.length > 1 ? ' and more' : ''})</>}
              </p>
            )}
          </div>
          <Link to={`/lessons/stage/${currentStage.id}`} className="btn btn-primary">
            Continue Learning →
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {PILLARS.map((pillar) => {
          const isLive = pillar.status === 'live';
          const isArabicQuran = pillar.key === 'arabic-quran';
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
              {isArabicQuran && currentStage ? (
                <>
                  <p style={{ margin: '0 0 8px', color: '#6b7a8a' }}>Stage {currentStage.orderIndex} of 16</p>
                  <div style={{ background: 'rgba(27,79,138,0.1)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(currentStage.orderIndex / 16) * 100}%`,
                        background: 'var(--color-blue)',
                        height: '100%',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, color: '#6b7a8a' }}>{pillar.tagline}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
