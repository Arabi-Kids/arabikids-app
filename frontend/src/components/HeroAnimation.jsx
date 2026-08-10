import HudMascot from './HudMascot.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

// Spec: "show, not just tell, how the platform works" - a lightweight CSS
// crossfade loop through the actual learning steps (letter -> word ->
// Qur'an meaning), no external video needed for v1. `videoUrl` is a slot
// for a produced explainer video later - when set, it replaces this
// animation outright rather than needing a separate hero variant built.
export default function HeroAnimation({ videoUrl = null }) {
  const { t } = useLanguage();
  const copy = t('heroAnimation');
  const STEPS = [
    { badge: copy.step1Badge, arabic: 'ب', sub: copy.step1Sub },
    { badge: copy.step2Badge, arabic: 'بِسْمِ', sub: copy.step2Sub },
    { badge: copy.step3Badge, arabic: 'بِسْمِ اللَّهِ', sub: copy.step3Sub },
  ];

  if (videoUrl) {
    return (
      <video className="hero-animation-video" src={videoUrl} autoPlay muted loop playsInline aria-label={copy.videoAria} />
    );
  }

  return (
    <div className="hero-animation" aria-hidden="true">
      {STEPS.map((step, i) => (
        <div key={i} className="hero-animation-step" style={{ animationDelay: `${i * 3}s` }}>
          <span className="hero-animation-badge">{step.badge}</span>
          <p className="arabic-text hero-animation-arabic">{step.arabic}</p>
          <p className="hero-animation-sub">{step.sub}</p>
        </div>
      ))}
      <div className="hero-animation-mascot">
        <HudMascot pose="mark" size={48} />
      </div>
    </div>
  );
}
