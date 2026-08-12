import { useCallback, useEffect, useState } from 'react';

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shared round-scoring shell for every game in this directory - extracted
 * verbatim from the original PlayTab.jsx matching game (score formula,
 * star conversion, mistake tracking, no-fail-state design). Each game
 * component owns its own interaction/selection mechanics (tap-pairs, drag,
 * flip-cards, sound-then-tap) and calls markMatched/markMistake as the
 * player succeeds/errs; this hook only owns "which items this round, how
 * many matched, how many mistakes, is it complete, what's the score."
 * `items` is the source pool (e.g. from getStageVocabulary); `size` caps
 * how many are drawn per round; `filter` optionally restricts eligible
 * items (e.g. word length limits some games need). */
export function useGameRound(pool, { size = 6, filter } = {}) {
  const [roundItems, setRoundItems] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [logged, setLogged] = useState(false);

  const startRound = useCallback(
    (sourcePool) => {
      const candidates = filter ? sourcePool.filter(filter) : sourcePool;
      setRoundItems(shuffle(candidates).slice(0, size));
      setMatchedIds([]);
      setMistakes(0);
      setLogged(false);
    },
    [size, filter]
  );

  useEffect(() => {
    if (pool.length > 0) startRound(pool);
  }, [pool, startRound]);

  const complete = roundItems.length > 0 && matchedIds.length === roundItems.length;
  const score = Math.max(50, 100 - mistakes * 10);
  const stars = Math.max(1, Math.round((score / 100) * 3));

  function markMatched(id) {
    setMatchedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }
  function markMistake() {
    setMistakes((m) => m + 1);
  }
  function restart() {
    startRound(pool);
  }

  return { roundItems, matchedIds, mistakes, complete, score, stars, logged, setLogged, markMatched, markMistake, restart };
}
