import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, listMasteredStageIds } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';
import { StarSparkleIcon } from '../components/Icons.jsx';
import Seo from '../components/Seo.jsx';

const CURRICULUM_SEO = {
  title: 'Arabic Curriculum | ArabiKids',
  description: 'Browse all 16 stages of the ArabiKids Arabic curriculum, from first letters to full sentences and fluent reading.',
  path: '/lessons/curriculum',
};

// One accent color per level (cycled), so the four levels visually read as
// distinct sections instead of one long uniform blue list.
const LEVEL_ACCENTS = ['var(--color-blue)', 'var(--color-teal)', 'var(--color-purple)', 'var(--color-orange)'];

function stageState(stage, currentStageOrder, isPaidUser) {
  if (stage.orderIndex > currentStageOrder) return 'locked';
  if (!stage.isFree && !isPaidUser) return 'locked-payment';
  return 'active';
}

export default function ArabicCurriculumHub() {
  const navigate = useNavigate();
  const { user, isPaid } = useAuth();
  const { activeChild, childProfiles, loading: childrenLoading } = useActiveChild();
  const { language, t } = useLanguage();
  const copy = t('curriculum');
  const [levels, setLevels] = useState([]);
  const [masteredStageIds, setMasteredStageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedParents, setExpandedParents] = useState({});

  // Levels/stages (names + structure, not lesson content) are public data -
  // fetch them regardless of auth so a signed-out visitor can see the shape
  // of the curriculum. Only fetch a specific child's mastered stages once
  // one is actually selected.
  useEffect(() => {
    getCurriculum(language)
      .then(({ levels: lv }) => setLevels(lv))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [language]);

  useEffect(() => {
    if (!activeChild) return;
    listMasteredStageIds(activeChild.id)
      .then(setMasteredStageIds)
      .catch((err) => setError(err.message));
  }, [activeChild]);

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const header = (
    <>
      <Link to="/lessons" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToHub}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>{copy.title}</h1>
    </>
  );

  const query = search.trim().toLowerCase();
  const matchesSearch = (stage) => !query || stage.name.toLowerCase().includes(query) || `stage ${stage.orderIndex}`.includes(query);
  const searchBox = (
    <input
      type="search"
      placeholder={copy.searchPlaceholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 320,
        margin: '16px 0 24px',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '2px solid #e0dccd',
        fontSize: '1rem',
      }}
    />
  );

  // Guest preview: show the full stage grid so a visitor can see exactly
  // what they'd be signing up for, but every stage is locked and leads to
  // login instead of real content.
  if (!user) {
    return (
      <div className="container" style={{ padding: '48px 0' }}>
        <Seo {...CURRICULUM_SEO} />
        {header}
        <p className="page-subtitle">{copy.subtitleGuest}</p>
        {searchBox}
        {error && <p className="error-text">{error}</p>}
        {levels.map((level, levelIndex) => {
          const stages = level.stages.filter(matchesSearch);
          if (stages.length === 0) return null;
          const levelAccent = LEVEL_ACCENTS[levelIndex % LEVEL_ACCENTS.length];
          return (
            <div key={level.id} style={{ marginBottom: 32 }}>
              <h2 style={{ color: 'var(--color-blue)', marginBottom: 4 }}>{level.name}</h2>
              <p style={{ color: '#8ea0b6', marginTop: 0 }}>{level.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {stages.map((stage) => (
                  <Link key={stage.id} to="/login" className="card card-kid" style={{ '--card-accent': levelAccent, display: 'block', opacity: 0.75 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{copy.stageLabel.replace('{n}', stage.orderIndex)}</span>
                      <span className="badge badge-locked">{copy.signIn}</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{stage.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (childrenLoading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  if (childProfiles.length === 0) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h1 className="page-title">{copy.addChildTitle}</h1>
        <p className="page-subtitle">{copy.addChildSubtitle}</p>
        <Link to="/add-child" className="btn btn-primary">{copy.addChildButton}</Link>
      </div>
    );
  }

  const currentStageOrder = levels
    .flatMap((l) => l.stages)
    .find((s) => s.id === activeChild?.currentStageId)?.orderIndex ?? 1;

  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <Seo {...CURRICULUM_SEO} />
      {header}
      <p className="page-subtitle">
        {(isPaid() ? copy.subtitlePaid : copy.subtitleFree).replace('{name}', activeChild?.name ?? '')}
      </p>
      {searchBox}

      {error && <p className="error-text">{error}</p>}

      {levels.map((level, levelIndex) => {
        const stages = level.stages.filter(matchesSearch);
        if (stages.length === 0) return null;
        const levelAccent = LEVEL_ACCENTS[levelIndex % LEVEL_ACCENTS.length];
        return (
        <div key={level.id} style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--color-blue)', marginBottom: 4 }}>{level.name}</h2>
          <p style={{ color: '#8ea0b6', marginTop: 0 }}>{level.description}</p>
          <Link to={`/lessons/level/${level.id}/printable`} className="badge badge-gold" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
            {copy.printable}
          </Link>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {stages.map((stage) => {
              const state = stageState(stage, currentStageOrder, isPaid());
              const isCurrent = stage.orderIndex === currentStageOrder;
              const isMastered = masteredStageIds.includes(stage.id);
              return (
                <Link
                  key={stage.id}
                  to={state === 'locked-payment' ? '/pricing' : state === 'locked' ? '#' : `/lessons/stage/${stage.id}`}
                  className="card card-kid"
                  onClick={(e) => state === 'locked' && e.preventDefault()}
                  style={{ '--card-accent': levelAccent, display: 'block', opacity: state === 'locked' ? 0.6 : 1, cursor: state === 'locked' ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{copy.stageLabel.replace('{n}', stage.orderIndex)}</span>
                    {state === 'locked' && <span className="badge badge-locked">{copy.locked}</span>}
                    {state === 'locked-payment' && <span className="badge badge-locked">{copy.subscribe}</span>}
                    {state === 'active' && isCurrent && <span className="badge badge-free">{copy.inProgress}</span>}
                    {state === 'active' && !isCurrent && isMastered && (
                      <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <StarSparkleIcon style={{ width: 12, height: 12 }} /> {copy.done}
                      </span>
                    )}
                    {/* Below the child's current stage but never actually completed —
                        possible when the placement test starts them ahead of Stage 1. */}
                    {state === 'active' && !isCurrent && !isMastered && (
                      <span className="badge badge-locked">{copy.notStarted}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{stage.name}</p>
                  {stage.introKids && (
                    <p style={{ margin: '6px 0 0', color: '#8ea0b6', fontSize: '0.85rem' }}>{stage.introKids}</p>
                  )}
                  {stage.introParents && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedParents((prev) => ({ ...prev, [stage.id]: !prev[stage.id] }));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          marginTop: 10,
                          color: 'var(--color-blue)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedParents[stage.id] ? copy.hideParents : copy.forParents}
                      </button>
                      {expandedParents[stage.id] && (
                        <p style={{ margin: '6px 0 0', color: '#4b5a6a', fontSize: '0.85rem' }}>{stage.introParents}</p>
                      )}
                    </>
                  )}
                  {state === 'active' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/lessons/stage/${stage.id}/review`);
                      }}
                      className={isMastered ? 'badge badge-gold' : 'badge badge-locked'}
                      style={{ display: 'inline-block', marginTop: 10, border: 'none', cursor: 'pointer' }}
                    >
                      {isMastered ? copy.reviewStage : copy.reviewHubLocked}
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
}
