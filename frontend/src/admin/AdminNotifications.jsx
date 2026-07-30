import { useEffect, useState } from 'react';
import { listAdminNotifications, sendAdminNotification } from '../lib/adminDb.js';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  function loadNotifications() {
    listAdminNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message));
  }

  useEffect(loadNotifications, []);

  async function handleSend(e) {
    e.preventDefault();
    // Email is a real, irreversible send to every parent account - confirm
    // before firing, since a misclick here can't be undone like a push can.
    if (sendEmail && !window.confirm('This will email every parent account. Are you sure?')) return;

    setSending(true);
    setError('');
    setResult('');
    try {
      const data = await sendAdminNotification({ title, body, url, sendEmail });
      const parts = [`${data.sent} device${data.sent === 1 ? '' : 's'}`];
      if (sendEmail) parts.push(`${data.emailsSent} email${data.emailsSent === 1 ? '' : 's'}`);
      setResult(`Sent to ${parts.join(' and ')}.${data.pruned ? ` Pruned ${data.pruned} stale push subscriptions.` : ''}`);
      setTitle('');
      setBody('');
      setUrl('');
      setSendEmail(false);
      loadNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Notifications</h1>

      <form onSubmit={handleSend} className="admin-card" style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 16px', color: 'var(--admin-muted)' }}>
          Broadcasts a real push notification to every device with push enabled, and adds it to the
          in-app Announcements feed every parent sees on their Account page.
        </p>
        <input
          className="admin-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="admin-input"
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
          style={{ resize: 'vertical' }}
        />
        <input
          className="admin-input"
          placeholder="Link (optional, e.g. /lessons/curriculum)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dbe4ee', margin: '4px 0 16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          Also send as a marketing email to every parent account
        </label>
        {error && <p style={{ color: '#e57373' }}>{error}</p>}
        {result && <p style={{ color: 'var(--admin-accent)' }}>{result}</p>}
        <button
          type="submit"
          disabled={sending}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            fontWeight: 800,
            cursor: sending ? 'default' : 'pointer',
            background: 'var(--admin-accent)',
            color: '#fff',
          }}
        >
          {sending ? 'Sending...' : 'Send to All'}
        </button>
      </form>

      <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12 }}>Send History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {notifications.map((n) => (
          <div key={n.id} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontWeight: 800, color: '#fff' }}>{n.title}</p>
              <p style={{ margin: 0, color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                {new Date(n.created_at).toLocaleString()} · {n.recipient_count} push recipient{n.recipient_count === 1 ? '' : 's'}
                {n.email_recipient_count > 0 && `, ${n.email_recipient_count} email${n.email_recipient_count === 1 ? '' : 's'}`}
              </p>
            </div>
            <p style={{ margin: '8px 0 0', color: '#dbe4ee' }}>{n.body}</p>
            {n.url && <p style={{ margin: '6px 0 0', color: 'var(--admin-accent)', fontSize: '0.85rem' }}>{n.url}</p>}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
            No notifications sent yet.
          </div>
        )}
      </div>
    </div>
  );
}
