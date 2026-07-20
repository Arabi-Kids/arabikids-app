import HudMascot from './HudMascot.jsx';

// Spec: "show, not just tell, how the platform works" - a lightweight CSS
// crossfade loop through the actual learning steps (letter -> word ->
// Qur'an meaning), no external video needed for v1. `videoUrl` is a slot
// for a produced explainer video later - when set, it replaces this
// animation outright rather than needing a separate hero variant built.
const STEPS = [
  { badge: '1. Learn a Letter', arabic: 'ب', sub: 'baa' },
  { badge: '2. See it in a Word', arabic: 'بِسْمِ', sub: '"Bismi"' },
  { badge: '3. Connect it to the Qur’an', arabic: 'بِسْمِ اللَّهِ', sub: 'in the name of Allah — Al-Fatihah 1:1' },
];

export default function HeroAnimation({ videoUrl = null }) {
  if (videoUrl) {
    return (
      <video className="hero-animation-video" src={videoUrl} autoPlay muted loop playsInline aria-label="How ArabiKids works" />
    );
  }

  return (
    <div className="hero-animation" aria-hidden="true">
      {STEPS.map((step, i) => (
        <div key={i} className="hero-animation-step" style={{ animationDelay: `${i * -3}s` }}>
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
