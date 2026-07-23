import { useState } from 'react';
import { isPushSupported, getPushPermission, enablePushForChild } from '../lib/push.js';

// Small opt-in for the daily streak-reminder push notification (see
// netlify/functions/send-streak-reminders.js). Browsers require a user
// gesture to request Notification permission, so this can't be automatic -
// shown inline wherever a child's streak is already visible.
export default function PushNotificationPrompt({ childId }) {
  const [status, setStatus] = useState('idle'); // idle | requesting | enabled | error
  const [error, setError] = useState('');

  if (!isPushSupported() || getPushPermission() === 'denied') return null;
  if (getPushPermission() === 'granted' && status === 'idle') return null;
  if (status === 'enabled') {
    return <p style={{ margin: '4px 0 0', color: 'var(--color-green)', fontSize: '0.85rem' }}>🔔 Streak reminders on</p>;
  }

  async function handleEnable() {
    setStatus('requesting');
    setError('');
    try {
      await enablePushForChild(childId);
      setStatus('enabled');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div style={{ marginTop: 4 }}>
      <button
        type="button"
        className="btn btn-outline"
        style={{ fontSize: '0.85rem', padding: '4px 12px' }}
        onClick={handleEnable}
        disabled={status === 'requesting'}
      >
        {status === 'requesting' ? 'Enabling...' : '🔔 Remind me to keep my streak'}
      </button>
      {error && <p className="error-text" style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>{error}</p>}
    </div>
  );
}
