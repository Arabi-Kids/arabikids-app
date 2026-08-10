import { useLanguage } from '../context/LanguageContext.jsx';

// A larger 4-step CSS crossfade loop for the How It Works page: learn a
// letter, trace/draw it, see it in a word, then a quick exercise - the same
// idea as HeroAnimation.jsx but showing the extra steps (tracing, checkpoint
// exercise) that the compact Home hero version doesn't have room for.
export default function LessonWalkthroughAnimation() {
  const { t } = useLanguage();
  const copy = t('walkthroughAnimation');

  return (
    <div className="walkthrough-animation" aria-hidden="true">
      <div className="walkthrough-step" style={{ animationDelay: '0s' }}>
        <span className="hero-animation-badge">{copy.step1Badge}</span>
        <p className="arabic-text walkthrough-arabic">ب</p>
        <p className="hero-animation-sub">{copy.step1Sub}</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '3s' }}>
        <span className="hero-animation-badge">{copy.step2Badge}</span>
        <div className="walkthrough-trace">
          <p className="arabic-text walkthrough-arabic walkthrough-trace-letter" style={{ animationDelay: '3s' }}>ب</p>
          <span className="walkthrough-pencil" style={{ animationDelay: '3s' }}>✏️</span>
        </div>
        <p className="hero-animation-sub">{copy.step2Sub}</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '6s' }}>
        <span className="hero-animation-badge">{copy.step3Badge}</span>
        <p className="arabic-text walkthrough-arabic">بِسْمِ</p>
        <p className="hero-animation-sub">{copy.step3Sub}</p>
      </div>

      <div className="walkthrough-step" style={{ animationDelay: '9s' }}>
        <span className="hero-animation-badge">{copy.step4Badge}</span>
        <p className="walkthrough-question">{copy.question}</p>
        <div className="walkthrough-options">
          <span className="walkthrough-option walkthrough-option-correct">{copy.correctOption}</span>
          <span className="walkthrough-option">{copy.wrongOption}</span>
        </div>
      </div>
    </div>
  );
}
