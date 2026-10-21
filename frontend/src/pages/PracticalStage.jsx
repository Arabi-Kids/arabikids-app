import { useEffect, useState } from 'react';
import MusicToggle from '../components/MusicToggle.jsx';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  getContentItems,
  listSeenIntroIds,
  markIntroSeen,
  completeContentItems,
  awardStickers,
  isFixtureMode,
} from '../lib/content.js';
import { demonstratorIds } from '../lib/characters.config.js';
import { ageFromDob } from '../lib/db.js';
import { playCelebration } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import useAudio from '../hooks/useAudio.js';
import Confetti from '../components/Confetti.jsx';
import Seo from '../components/Seo.jsx';
import DemonstratorPicker from '../components/practical/DemonstratorPicker.jsx';
import WuduFlow from '../components/practical/WuduFlow.jsx';
import AdhkarFlow from '../components/practical/AdhkarFlow.jsx';
import DuaFlow from '../components/practical/DuaFlow.jsx';
import BrowseFlow from '../components/practical/BrowseFlow.jsx';

const STAGE_COUNT = 10;

export default function PracticalStage() {
  const { stageNo } = useParams();
  const n = Math.min(STAGE_COUNT, Math.max(1, Number(stageNo) || 1));
  const { isPaid, isAdmin } = useAuth();
  const { activeChild } = useActiveChild();
  const { language, t } = useLanguage();
  const copy = t('interactive.practical');
  const audioCopy = t('interactive.intro');
  const audio = useAudio();
  const [isCheering, triggerCheer] = useCelebrate();

  const [items, setItems] = useState([]);
  const [hostLines, setHostLines] = useState([]);
  const [seen, setSeen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chosen, setChosen] = useState(null);

  const locked = n > 1 && !isPaid() && !isAdmin() && !isFixtureMode;
  const introId = `practical-stage-${n}`;

  useEffect(() => {
    if (locked) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setCompleted(false);
    (async () => {
      try {
        const [stageItems, lines] = await Promise.all([
          getContentItems({ stageNo: n }),
          getContentItems({ kind: 'host_line' }),
        ]);
        if (cancelled) return;
        setItems(stageItems);
        setHostLines(lines.filter((l) => l.data.character === 'practical'));
        if (activeChild) {
          const ids = await listSeenIntroIds(activeChild.id).catch(() => []);
          if (!cancelled) setSeen(ids.includes(introId));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [n, locked, activeChild?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFinish() {
    if (!activeChild) {
      setCompleted(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const completable = items
        .filter((i) => ['wudu_lesson', 'dhikr', 'dua', 'movement', 'prayer_time', 'phrase', 'prayer_order', 'manner'].includes(i.kind))
        .map((i) => i.id);
      await completeContentItems({ childId: activeChild.id, itemIds: completable });
      const stickers =
        n === 1
          ? ['wudu-hero']
          : n === 10
            ? ['adhkar-stage']
            : n >= 6
            ? items.filter((i) => i.kind === 'dua').map((i) => `dua-${i.id}`)
            : [`practical-stage-${n}`];
      await awardStickers(activeChild.id, stickers);
      setCompleted(true);
      playCelebration();
      triggerCheer();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (locked) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <h1 className="page-title">{copy.lockedTitle}</h1>
        <p className="page-subtitle">{copy.lockedSubtitle}</p>
        <Link to="/pricing" className="btn btn-primary">{copy.viewPricing}</Link>
      </div>
    );
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>{copy.loading}</div>;

  const needsPick = activeChild && !activeChild.demonstrator && !chosen;
  const { demonstrator, friend } = demonstratorIds(chosen ? { demonstrator: chosen } : activeChild);
  const ageYears = activeChild ? ageFromDob(activeChild.dateOfBirth) : null;
  const isDraft = items.some((i) => i.reviewStatus && i.reviewStatus !== 'approved');

  const flowProps = {
    stageNo: n,
    items,
    hostLines,
    demonstratorId: demonstrator,
    friendId: friend,
    language,
    audio,
    seen,
    copy,
    audioCopy,
    reward: {
      completed,
      submitting,
      error,
      cheering: isCheering,
      onFinish: handleFinish,
      onIntroDone: () => {
        if (activeChild) markIntroSeen(activeChild.id, introId).catch(() => {});
      },
    },
  };

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 720 }}>
      <MusicToggle mood="calm" />
      <Seo title={`${copy.stageNames[n]} | ArabiKids`} description={copy.subtitle} path={`/lessons/practical/stage/${n}`} />
      <Link to="/lessons/practical" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
        {copy.backToHub}
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {copy.stageLabel.replace('{n}', n)}: {copy.stageNames[n]}
      </h1>
      {isDraft && <p className="badge badge-orange" style={{ display: 'inline-block', marginBottom: 12 }}>{copy.draftBadge}</p>}

      <Confetti active={completed} />

      {needsPick ? (
        <DemonstratorPicker copy={copy} onChosen={setChosen} />
      ) : n === 1 ? (
        <WuduFlow {...flowProps} ageYears={ageYears} />
      ) : n === 10 ? (
        <AdhkarFlow {...flowProps} />
      ) : n >= 6 ? (
        <DuaFlow {...flowProps} />
      ) : (
        <BrowseFlow {...flowProps} />
      )}
    </div>
  );
}
