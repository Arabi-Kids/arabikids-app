import { useEffect, useMemo, useState } from 'react';
import { getLevelPrintableData } from '../lib/db.js';
import { speakSmart } from '../lib/speech.js';
import HudMascot from './HudMascot.jsx';

// Stands in for a produced recap video (see StageVideo.jsx) until one
// exists: a narrated, auto-advancing slideshow built entirely from data
// already in the app - this stage's own letters/vocabulary/tajweed content
// (reusing getLevelPrintableData's aggregation, scoped to one stage) plus
// the existing speakSmart narration (device Arabic voice, or the
// pre-generated ElevenLabs fallback) - no video file, no external
// dependency. Auto-advances one slide per narration (via speakSmart's
// onEnd), with manual prev/next/play-pause as an escape hatch.
const AUTO_ADVANCE_DELAY_MS = 900;
const STATIC_SLIDE_DURATION_MS = 4500;

function buildSlides(stageName, data) {
  const slides = [{ kind: 'intro' }];

  for (const l of data.letters) {
    slides.push({ kind: 'letter', arabic: l.letter, label: l.name, speak: l.letter });
  }
  if (data.tanweenForms) {
    for (const f of data.tanweenForms.forms) {
      slides.push({ kind: 'letter', arabic: f.arabic, label: f.label, speak: f.arabic });
    }
  }
  for (const v of data.vocabulary) {
    slides.push({ kind: 'word', arabic: v.arabic, label: v.transliteration, meaning: v.meaning, speak: v.arabic });
  }
  for (const rule of data.tajweedRules) {
    slides.push({ kind: 'rule', arabic: rule.example.arabic, label: rule.name, meaning: rule.kidExplanation, speak: rule.example.arabic });
  }
  for (const cmp of data.comparisons) {
    slides.push({ kind: 'compare', items: cmp.items });
  }

  slides.push({ kind: 'outro', stageName });
  return slides;
}

export default function StageRecapAnimation({ stageId, stageName }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    getLevelPrintableData(undefined, [stageId])
      .then(setData)
      .catch((err) => setError(err.message));
  }, [stageId]);

  const slides = useMemo(() => (data ? buildSlides(stageName, data) : []), [data, stageName]);
  const slide = slides[index];

  useEffect(() => {
    if (!playing || !slide) return undefined;
    let cancelled = false;
    let timer;

    function goNext() {
      if (cancelled) return;
      setIndex((i) => Math.min(i + 1, slides.length - 1));
    }

    if (slide.speak) {
      speakSmart(slide.speak, { rate: 0.75, onEnd: () => { timer = setTimeout(goNext, AUTO_ADVANCE_DELAY_MS); } });
    } else if (index < slides.length - 1) {
      timer = setTimeout(goNext, STATIC_SLIDE_DURATION_MS);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, slides.length]);

  if (error) return <p className="error-text">{error}</p>;
  if (!data || !slide) return <p style={{ color: '#8ea0b6' }}>Loading recap...</p>;

  const atEnd = index === slides.length - 1;
  const progress = slides.length > 1 ? index / (slides.length - 1) : 1;

  return (
    <div className="stage-recap-anim">
      <div className="stage-recap-anim-progress">
        <div className="stage-recap-anim-progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>

      <div key={index} className="stage-recap-anim-slide">
        {slide.kind === 'intro' && (
          <>
            <HudMascot pose="hero" size={90} className="mascot-bounce" />
            <p className="stage-recap-anim-badge">Stage Recap</p>
            <h3 className="stage-recap-anim-title">{stageName}</h3>
          </>
        )}

        {slide.kind === 'letter' && (
          <>
            <p className="arabic-text stage-recap-anim-arabic">{slide.arabic}</p>
            <p className="stage-recap-anim-label">{slide.label}</p>
          </>
        )}

        {(slide.kind === 'word' || slide.kind === 'rule') && (
          <>
            <p className="arabic-text stage-recap-anim-arabic">{slide.arabic}</p>
            {slide.label && <p className="stage-recap-anim-label">"{slide.label}"</p>}
            {slide.meaning && <p className="stage-recap-anim-meaning">{slide.meaning}</p>}
          </>
        )}

        {slide.kind === 'compare' && (
          <div className="stage-recap-anim-compare">
            {slide.items.map((item, i) => (
              <button
                key={i}
                type="button"
                className="stage-recap-anim-compare-item"
                onClick={() => speakSmart(item.arabic, { rate: 0.75 })}
              >
                <span className="arabic-text">{item.arabic}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {slide.kind === 'outro' && (
          <>
            <HudMascot pose="celebrate" size={90} className="mascot-bounce" />
            <h3 className="stage-recap-anim-title">Great job!</h3>
            <p className="stage-recap-anim-label">You reviewed everything in {slide.stageName}.</p>
          </>
        )}
      </div>

      <div className="stage-recap-anim-controls">
        <button type="button" className="btn btn-outline" onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}>
          ← Back
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setPlaying((p) => !p)}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={atEnd}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
