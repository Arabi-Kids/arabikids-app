import { useEffect } from 'react';
import HudMascot from '../HudMascot.jsx';
import Confetti from '../Confetti.jsx';
import { useCelebrate } from '../../hooks/useCelebrate.js';
import { playSuccess } from '../../lib/sounds.js';

/** The Confetti + celebrating mascot + stars + "Play Again" block, extracted
 * from the original PlayTab.jsx so every game in this directory shares one
 * completion moment instead of re-implementing it. Never a fail state -
 * this only ever renders when `active` (i.e. the round is complete). */
export default function GameCompleteCard({ active, stars, title, onPlayAgain, playAgainLabel }) {
  const [isCheering, triggerCheer] = useCelebrate();

  useEffect(() => {
    if (active) {
      playSuccess();
      triggerCheer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div className="card" style={{ textAlign: 'center', background: 'rgba(200,150,12,0.08)', marginBottom: 16 }}>
      <Confetti active={active} />
      <HudMascot pose="celebrate" size={64} className={isCheering ? 'mascot-cheer' : ''} style={{ margin: '0 auto 8px' }} />
      <h3 style={{ margin: '0 0 4px' }}>{title}</h3>
      <p style={{ margin: '0 0 12px', fontSize: '1.4rem' }}>{'⭐'.repeat(stars)}</p>
      <button className="btn btn-primary" onClick={onPlayAgain}>{playAgainLabel}</button>
    </div>
  );
}
