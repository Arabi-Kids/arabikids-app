// A larger 4-step CSS crossfade loop for the How It Works page: learn a
// letter, trace/draw it, see it in a word, then a quick exercise - the same
// idea as HeroAnimation.jsx but showing the extra steps (tracing, checkpoint
// exercise) that the compact Home hero version doesn't have room for.
export default function LessonWalkthroughAnimation() {
  return (
    <div className="walkthrough-animation" aria-hidden="true">
      <div className="walkthrough-step" style={{ animationDelay: '0s' }}>
        <span className="hero-animation-badge">1. Learn a Letter</span>
        <p className="arabic-text walkthrough-arabic">ب</p>
        <p className="hero-animation-sub">baa</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '3s' }}>
        <span className="hero-animation-badge">2. Trace It</span>
        <div className="walkthrough-trace">
          <p className="arabic-text walkthrough-arabic walkthrough-trace-letter" style={{ animationDelay: '3s' }}>ب</p>
          <span className="walkthrough-pencil" style={{ animationDelay: '3s' }}>✏️</span>
        </div>
        <p className="hero-animation-sub">Draw the shape</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '6s' }}>
        <span className="hero-animation-badge">3. See it in a Word</span>
        <p className="arabic-text walkthrough-arabic">بِسْمِ</p>
        <p className="hero-animation-sub">"Bismi" — in the name of</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '9s' }}>
        <span className="hero-animation-badge">4. Quick Exercise</span>
        <p className="walkthrough-question">What does بِسْمِ mean?</p>
        <div className="walkthrough-options">
          <span className="walkthrough-option walkthrough-option-correct">in the name of ✓</span>
          <span className="walkthrough-option">the recitation</span>
        </div>
      </div>
    </div>
  );
}
