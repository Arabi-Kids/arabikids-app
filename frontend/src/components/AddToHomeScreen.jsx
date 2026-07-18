import { useEffect, useState } from 'react';

// Public-site-only "install ArabiKids" banner. Listens for the browser's
// beforeinstallprompt event and offers a one-tap install; dismiss is
// remembered per-browser so it doesn't nag on every visit.
export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('arabikids_a2hs_dismissed') === '1');

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function install() {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function dismiss() {
    localStorage.setItem('arabikids_a2hs_dismissed', '1');
    setDismissed(true);
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 420,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-soft)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
      }}
    >
      <span style={{ fontSize: '1.6rem' }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-blue)' }}>Install ArabiKids</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7a8a' }}>Add to your home screen for quick, offline-friendly access.</p>
      </div>
      <button className="btn btn-outline" style={{ padding: '8px 14px' }} onClick={dismiss}>
        Later
      </button>
      <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={install}>
        Install
      </button>
    </div>
  );
}
