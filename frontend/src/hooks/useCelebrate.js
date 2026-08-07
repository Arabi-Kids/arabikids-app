import { useCallback, useRef, useState } from 'react';

/** Returns [isCheering, triggerCheer] - isCheering toggles true for a short
 * burst (default 800ms) so a caller can conditionally add the `.mascot-cheer`
 * class to a mascot. Callers pair this with a lib/sounds.js play call at the
 * same trigger site (e.g. PronunciationCheck.jsx's "scored" transition) so
 * sound and motion always happen together. */
export function useCelebrate(durationMs = 800) {
  const [isCheering, setIsCheering] = useState(false);
  const timeoutRef = useRef(null);

  const triggerCheer = useCallback(() => {
    setIsCheering(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsCheering(false), durationMs);
  }, [durationMs]);

  return [isCheering, triggerCheer];
}
