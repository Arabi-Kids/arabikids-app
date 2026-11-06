import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { listContentIndex, getContentItems, listCompletedContentIds, listStickers } from '../lib/content.js';
import { LETTER_STAGES, stageStickerId } from '../lib/letterStages.js';

/** Everything the stage screens need: the letter index (names only, includes locked ones),
 * the full letter rows the learner may open, which letters are done and which stage tests
 * are passed (sticker `letter-stage-N`). */
export default function useLetterStages() {
  const { user, isAdmin } = useAuth();
  const { activeChild } = useActiveChild();
  const [index, setIndex] = useState([]);
  const [rows, setRows] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [passed, setPassed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      (isAdmin() ? getContentItems({ kind: 'letter' }) : listContentIndex('letter')),
      getContentItems({ kind: 'letter' }).catch(() => []),
    ])
      .then(([idx, full]) => {
        if (cancelled) return;
        setIndex(idx);
        setRows(full);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeChild) {
      setCompleted([]);
      setPassed([]);
      return;
    }
    listCompletedContentIds(activeChild.id).then(setCompleted).catch(() => {});
    listStickers(activeChild.id)
      .then((s) => {
        const ids = new Set(s.map((x) => x.stickerId));
        setPassed(LETTER_STAGES.filter((st) => ids.has(stageStickerId(st.n))).map((st) => st.n));
      })
      .catch(() => {});
  }, [activeChild?.id]);

  return { index, rows, completed, passed, setPassed, loading, error, activeChild };
}
