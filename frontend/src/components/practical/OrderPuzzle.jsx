import { useMemo, useState } from 'react';
import { playTap, playSuccess } from '../../lib/sounds.js';
import { localized, shuffled } from '../../lib/contentHelpers.js';
import { WuduIcon, CheckIcon } from './shared.jsx';

/** "Put the steps in order": cards start shuffled; tap them in the correct
 * order and each locks into its slot. A wrong tap shakes the card and the
 * slot hint stays - there is no failure state. */
export default function OrderPuzzle({ items, language, copy, onDone, restartKey = 0 }) {
  const pool = useMemo(() => shuffled(items), [items, restartKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState([]);
  const [shakeId, setShakeId] = useState(null);
  const complete = placed.length === items.length;

  function handlePick(item) {
    if (complete) return;
    const expected = items[placed.length];
    if (item.id === expected.id) {
      playTap();
      const next = [...placed, item.id];
      setPlaced(next);
      if (next.length === items.length) {
        playSuccess();
        onDone?.();
      }
    } else {
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 450);
    }
  }

  function reset() {
    setPlaced([]);
  }

  return (
    <div>
      <p style={{ margin: '0 0 12px', color: '#4b5a6a', fontWeight: 700 }}>
        {complete ? copy.orderDone : copy.orderHelp.replace('{n}', placed.length + 1)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
        {pool.map((item) => {
          const isPlaced = placed.includes(item.id);
          const slot = placed.indexOf(item.id) + 1;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isPlaced}
              onClick={() => handlePick(item)}
              style={{
                padding: '12px 10px',
                borderRadius: 16,
                textAlign: 'center',
                cursor: isPlaced ? 'default' : 'pointer',
                border: `3px solid ${isPlaced ? 'var(--color-green)' : 'var(--color-blue)'}`,
                background: isPlaced ? 'rgba(26,122,74,0.1)' : '#fff',
                opacity: isPlaced ? 0.75 : 1,
                animation: shakeId === item.id ? 'washShake 0.4s' : undefined,
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>{isPlaced ? (<><CheckIcon size={30} /><b style={{ color: 'var(--color-green)' }}>{slot}</b></>) : <WuduIcon id={item.id} size={38} />}</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{localized(item, language)}</span>
            </button>
          );
        })}
      </div>

      {placed.length > 0 && (
        <button type="button" className="btn btn-outline" onClick={reset}>
          {copy.orderReset}
        </button>
      )}
    </div>
  );
}
