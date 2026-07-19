import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import HudMascot from './HudMascot.jsx';

const REMINDER_MINUTES = 30;
const SNOOZE_MINUTES = 5;
const CHECK_INTERVAL_MS = 30_000;

// Gentle nudge, not a hard block — a parent-facing screen-time concern, not
// an enforcement mechanism. Tracks wall-clock time since this child was last
// selected (sessionStorage, so it resets when the browser tab closes),
// regardless of which page they're on within the app.
export default function SessionPacingReminder() {
  const { activeChildId, activeChild } = useActiveChild();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const nextThresholdRef = useRef(REMINDER_MINUTES);

  useEffect(() => {
    setVisible(false);
    if (!activeChildId) return undefined;

    const startKey = `pacing:start:${activeChildId}`;
    const thresholdKey = `pacing:next:${activeChildId}`;

    if (!sessionStorage.getItem(startKey)) {
      sessionStorage.setItem(startKey, String(Date.now()));
    }
    nextThresholdRef.current = Number(sessionStorage.getItem(thresholdKey)) || REMINDER_MINUTES;

    const check = () => {
      const start = Number(sessionStorage.getItem(startKey));
      const elapsedMinutes = (Date.now() - start) / 60_000;
      if (elapsedMinutes >= nextThresholdRef.current) setVisible(true);
    };
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeChildId]);

  function bumpThreshold(minutes) {
    nextThresholdRef.current += minutes;
    sessionStorage.setItem(`pacing:next:${activeChildId}`, String(nextThresholdRef.current));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18,58,102,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 380, textAlign: 'center' }}>
        <HudMascot pose="mark" size={72} style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)', margin: '0 0 8px', fontSize: '1.4rem' }}>
          Time for a stretch?
        </h2>
        <p style={{ color: '#4b5a6a', marginBottom: 20 }}>
          {activeChild?.name ?? 'Your child'} has been learning for a while — a short break helps it stick.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => bumpThreshold(SNOOZE_MINUTES)}>
            5 More Minutes
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              bumpThreshold(REMINDER_MINUTES);
              navigate('/progress');
            }}
          >
            Take a Break
          </button>
        </div>
      </div>
    </div>
  );
}
