import HudMascot from './HudMascot.jsx';
import { CatIcon } from './VocabIcons.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

// Spec: "show, not just tell, how the platform works" - a lightweight CSS
// crossfade loop through the actual learning steps (word -> game -> Qur'an
// connection), no external video needed for v1. `videoUrl` is a slot for a
// produced explainer video later - when set, it replaces this animation
// outright rather than needing a separate hero variant built.
export default function HeroAnimation({ videoUrl = null }) {
  const { t } = useLanguage();
  const copy = t('heroAnimation');

  if (videoUrl) {
    return (
      <video className="hero-animation-video" src={videoUrl} autoPlay muted loop playsInline aria-label={copy.videoAria} />
    );
  }

  return (
    <div className="hero-animation" aria-hidden="true">
      <div className="hero-animation-step" style={{ animationDelay: '0s' }}>
        <span className="hero-animation-badge">{copy.step1Badge}</span>
        <div className="hero-animation-icon-badge">
          <CatIcon width={40} height={40} />
        </div>
        <p className="arabic-text" style={{ fontSize: '1.7rem', margin: '6px 0 2px', color: 'var(--color-blue-dark)' }}>قِطة</p>
        <p className="hero-animation-sub">{copy.step1Sub}</p>
      </div>
      <div className="hero-animation-step" style={{ animationDelay: '3s' }}>
        <span className="hero-animation-badge">{copy.step2Badge}</span>
        <div className="hero-animation-game-scene">
          <span className="arabic-text hero-animation-chip">قِطة</span>
          <span className="hero-animation-arrow">→</span>
          <span className="hero-animation-icon-badge hero-animation-icon-badge-sm">
            <CatIcon width={26} height={26} />
          </span>
        </div>
        <p className="hero-animation-sub">{copy.step2Sub}</p>
      </div>
      <div className="hero-animation-step" style={{ animationDelay: '6s' }}>
        <span className="hero-animation-badge">{copy.step3Badge}</span>
        <p className="arabic-text hero-animation-arabic">بِسْمِ اللَّهِ</p>
        <p className="hero-animation-sub">{copy.step3Sub}</p>
      </div>
      <div className="hero-animation-mascot">
        <HudMascot pose="mark" size={48} />
      </div>
    </div>
  );
}
