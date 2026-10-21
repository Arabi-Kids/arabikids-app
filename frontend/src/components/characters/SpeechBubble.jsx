import { useEffect, useMemo, useState } from 'react';
import './characters.css';

/** Which word to highlight while a clip plays (no lip sync in v1).
 *  `timings` = [{ start, end }] in seconds per word (audio_assets.timings_json)
 *  when an alignment exists; otherwise a fixed interval over `durationMs`. */
export function useWordHighlight(text, { playing, timings, durationMs, restartKey } = {}) {
  const words = useMemo(() => (text || '').split(/\s+/).filter(Boolean), [text]);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (!playing || words.length === 0) {
      setIndex(-1);
      return undefined;
    }
    const start = performance.now();
    const perWord = (durationMs ?? words.length * 420) / words.length / 1000;
    const useTimings = Array.isArray(timings) && timings.length === words.length;

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      let i = 0;
      if (useTimings) {
        for (let k = 0; k < timings.length; k += 1) if (t >= timings[k].start) i = k;
      } else {
        i = Math.min(words.length - 1, Math.floor(t / perWord));
      }
      setIndex(i);
    };
    tick();
    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, [playing, words.length, timings, durationMs, restartKey]);

  return { words, index };
}

/** Character speech bubble with per-word highlighting. */
export default function SpeechBubble({ text, activeIndex = -1, dir, className = '', style, children }) {
  const words = (text || '').split(/\s+/).filter(Boolean);
  return (
    <div className={`ck-bubble ${className}`.trim()} dir={dir} style={style}>
      <span>
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className={`ck-word${i === activeIndex ? ' ck-word-on' : ''}`}>
            {w}{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
      {children}
    </div>
  );
}
