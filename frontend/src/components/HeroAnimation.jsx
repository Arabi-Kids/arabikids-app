import AnimalArt from './animals/AnimalArt.jsx';
import CharacterAvatar from './characters/CharacterAvatar.jsx';
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
        <span className="hero-animation-badge">{copy.n1Badge}</span>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
          <AnimalArt name="duck" size={96} />
        </div>
        <p className="arabic-text" style={{ fontSize: '1.7rem', margin: '2px 0', color: 'var(--color-blue-dark)' }}>بَاء · بَطَّة</p>
        <p className="hero-animation-sub">{copy.n1Sub}</p>
      </div>
      <div className="hero-animation-step" style={{ animationDelay: '3s' }}>
        <span className="hero-animation-badge">{copy.n2Badge}</span>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
          <CharacterAvatar id="hudi" state="cheer" size={96} />
        </div>
        <p className="hero-animation-sub">{copy.n2Sub}</p>
      </div>
      <div className="hero-animation-step" style={{ animationDelay: '6s' }}>
        <span className="hero-animation-badge">{copy.n3Badge}</span>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '4px 0' }}>
          <CharacterAvatar id="amir" state="idle" size={84} />
          <CharacterAvatar id="nur" state="idle" size={84} />
        </div>
        <p className="hero-animation-sub">{copy.n3Sub}</p>
      </div>
    </div>
  );
}
