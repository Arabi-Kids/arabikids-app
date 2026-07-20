import { useEffect, useState } from 'react';
import { listContactMessages, setContactMessageHandled } from '../lib/adminDb.js';

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('open');
  const [error, setError] = useState('');

  function loadMessages() {
    listContactMessages({ status })
      .then(setMessages)
      .catch((err) => setError(err.message));
  }

  useEffect(loadMessages, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleHandled(message) {
    try {
      await setContactMessageHandled(message.id, !message.handled);
      loadMessages();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Support & Contact</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select className="admin-input" style={{ maxWidth: 200, marginBottom: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="handled">Handled</option>
          <option value="all">All messages</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m) => (
          <div key={m.id} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 800, color: '#fff' }}>{m.name}</p>
                <a href={`mailto:${m.email}`} style={{ color: 'var(--admin-accent)', fontSize: '0.85rem' }}>{m.email}</a>
                <p style={{ margin: '4px 0 0', color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => toggleHandled(m)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: m.handled ? 'rgba(255,255,255,0.1)' : 'var(--admin-accent)',
                  color: m.handled ? 'var(--admin-muted)' : '#fff',
                  flexShrink: 0,
                }}
              >
                {m.handled ? 'Mark as Open' : 'Mark as Handled'}
              </button>
            </div>
            <p style={{ margin: '12px 0 0', color: '#dbe4ee', whiteSpace: 'pre-wrap' }}>{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
            No {status === 'all' ? '' : status} messages.
          </div>
        )}
      </div>
    </div>
  );
}
