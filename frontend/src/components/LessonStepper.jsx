import { useState } from 'react';
import { playWhoosh } from '../lib/sounds.js';
import { useLanguage } from '../context/LanguageContext.jsx';

/** Shows one lesson section at a time instead of one long scrolling page -
 * each concept/letter-set/game/etc. gets its own focused "screen" with a
 * step-change whoosh + a CSS pop-in, matching how a lesson full of tap
 * targets stays legible for a young kid. The last step (lesson-complete CTA)
 * carries its own primary action, so the stepper hides its own "Next" there
 * rather than doubling up on buttons. */
export default function LessonStepper({ steps, hideNextOnLast = true }) {
  const [index, setIndex] = useState(0);
  const { t } = useLanguage();
  const total = steps.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  function go(next) {
    if (next < 0 || next >= total) return;
    playWhoosh();
    setIndex(next);
  }

  return (
    <div>
      <div className="lesson-step-progress" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.key} className={`lesson-step-dot${i === index ? ' active' : ''}${i < index ? ' done' : ''}`} />
        ))}
      </div>
      <p style={{ textAlign: 'center', color: '#8ea0b6', fontWeight: 700, fontSize: '0.8rem', margin: '0 0 12px' }}>
        {t('lesson.stepOf', { n: index + 1, total })}
      </p>

      <div key={steps[index].key} className="lesson-step-screen">
        {steps[index].node}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
        <button
          type="button"
          className="btn btn-outline btn-chunky"
          onClick={() => go(index - 1)}
          style={{ visibility: isFirst ? 'hidden' : 'visible' }}
        >
          {t('lesson.stepBack')}
        </button>
        {!(isLast && hideNextOnLast) && (
          <button type="button" className="btn btn-primary btn-chunky" onClick={() => go(index + 1)}>
            {t('lesson.stepNext')}
          </button>
        )}
      </div>
    </div>
  );
}
