import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, getChildProgressSummary } from '../lib/db.js';
import { badgeInfo } from '../lib/badges.js';
import { PILLARS } from '../lib/pillars.js';
import HudMascot from '../components/HudMascot.jsx';
import ZaydMascot from '../components/ZaydMascot.jsx';
import AmalMascot from '../components/AmalMascot.jsx';
import PushNotificationPrompt from '../components/PushNotificationPrompt.jsx';
import Seo from '../components/Seo.jsx';

export default function LessonHub() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { t } = useLanguage();
  const copy = t('lessonsHub');
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
      <Seo
        title="Lessons Hub | ArabiKids"
        description="Explore ArabiKids' learning pillars and browse the 16-stage Arabic and Qur'an curriculum, from first letters to fluent recitation."
        path="/lessons"
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
        <HudMascot pose="mark" size={56} className="mascot-bounce" style={{ animationDelay: '0s' }} />
        <ZaydMascot pose="hero" size={56} className="mascot-bounce" style={{ animationDelay: '0.2s' }} />
        <AmalMascot pose="hero" size={56} className="mascot-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
      <h1 className="page-title" style={{ textAlign: 'center' }}>{copy.title}</h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>{copy.subtitle}</p>

      {user && activeChild && currentStage && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <HudMascot pose="mark" size={56} className="mascot-bounce" />
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
            <PushNotificationPrompt childId={activeChild.id} />
          </div>
          <Link to={`/lessons/stage/${currentStage.id}`} className="btn btn-primary btn-chunky">
            {copy.continueLearning} →
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {PILLARS.map((pillar) => {
          const isLive = pillar.status === 'live';
          const isArabicQuran = pillar.key === 'arabic-quran';
          const pillarCopy = copy.pillars[pillar.key] ?? pillar;
          return (
            <Link
              key={pillar.key}
              to={isLive ? pillar.path : `/lessons/coming-soon/${pillar.key}`}
              className="card card-kid"
              style={{ '--card-accent': pillar.accent, display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '3rem' }}>{pillar.icon}</span>
                {isLive ? (
                  <span className="badge badge-free">{copy.live}</span>
                ) : (
                  <span className="badge badge-locked">{copy.comingSoon}</span>
                )}
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 800, color: 'var(--color-blue)', fontSize: '1.1rem' }}>{pillarCopy.name}</p>
              {isArabicQuran && currentStage ? (
                <>
                  <p style={{ margin: '0 0 8px', color: '#6b7a8a' }}>{copy.stageOf.replace('{n}', currentStage.orderIndex)}</p>
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
                <p style={{ margin: 0, color: '#6b7a8a' }}>{pillarCopy.tagline}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
