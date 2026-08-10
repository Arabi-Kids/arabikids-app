import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAdminNotifications, listUsers, sendAdminNotification } from '../lib/adminDb.js';

const STATUS_LABELS = { free: 'Free', active: 'Active', past_due: 'Past Due', canceled: 'Canceled' };

function buildSegmentLabel(status, dateFrom, dateTo) {
  const parts = [status ? `${STATUS_LABELS[status]} clients` : 'All clients'];
  if (dateFrom && dateTo) parts.push(`registered ${dateFrom} to ${dateTo}`);
  else if (dateFrom) parts.push(`registered after ${dateFrom}`);
  else if (dateTo) parts.push(`registered before ${dateTo}`);
  return parts.join(', ');
}

const inputStyle = { marginBottom: 0 };

export default function AdminNotifications() {
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const [targetMode, setTargetMode] = useState('all'); // 'all' | 'specific' | 'segment'

  // Specific-client picker
  const [selectedClient, setSelectedClient] = useState(null); // { id, name, email }
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);

  // Filtered-segment picker
  const [segmentStatus, setSegmentStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [matchCount, setMatchCount] = useState(null);

  function loadNotifications() {
    listAdminNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message));
  }

  useEffect(loadNotifications, []);

  // A "Notify" link from AdminUsers.jsx lands here with the client already
  // chosen, so the admin doesn't have to search for them again.
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId) return;
    setTargetMode('specific');
    setSelectedClient({ id: userId, name: searchParams.get('name') || '', email: searchParams.get('email') || '' });
  }, [searchParams]);

  // Debounced live search for the specific-client picker.
  useEffect(() => {
    if (targetMode !== 'specific' || !clientSearch.trim()) {
      setClientResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      listUsers({ search: clientSearch })
        .then((rows) => {
          if (!cancelled) setClientResults(rows.filter((u) => u.role === 'parent').slice(0, 8));
        })
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [targetMode, clientSearch]);

  // Informational-only live match count for the filtered-segment picker -
  // the real audience is always re-resolved server-side on send.
  useEffect(() => {
    if (targetMode !== 'segment') {
      setMatchCount(null);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      listUsers({ status: segmentStatus || undefined })
        .then((rows) => {
          if (cancelled) return;
          const fromTime = dateFrom ? new Date(dateFrom).getTime() : null;
          const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
          const matched = rows.filter((u) => {
            if (u.role !== 'parent') return false;
            const t = new Date(u.created_at).getTime();
            if (fromTime !== null && t < fromTime) return false;
            if (toTime !== null && t > toTime) return false;
            return true;
          });
          setMatchCount(matched.length);
        })
        .catch(() => setMatchCount(null));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [targetMode, segmentStatus, dateFrom, dateTo]);

  function audienceDescription() {
    if (targetMode === 'specific') return selectedClient?.email || 'the selected client';
    if (targetMode === 'segment') return `~${matchCount ?? '?'} matching client${matchCount === 1 ? '' : 's'}`;
    return 'every parent account';
  }

  async function handleSend(e) {
    e.preventDefault();
    setError('');
    setResult('');

    if (!sendPush && !sendEmail) {
      setError('Select at least one channel (push or email).');
      return;
    }
    if (targetMode === 'specific' && !selectedClient) {
      setError('Search for and select a client first.');
      return;
    }

    // Email is a real, irreversible send - confirm before firing, since a
    // misclick here can't be undone like a push can.
    if (sendEmail && !window.confirm(`This will email ${audienceDescription()}. Are you sure?`)) return;

    let userId, filters, recipientLabel;
    if (targetMode === 'specific') {
      userId = selectedClient.id;
      recipientLabel = `${selectedClient.name} (${selectedClient.email})`;
    } else if (targetMode === 'segment') {
      filters = {
        status: segmentStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
      };
      recipientLabel = buildSegmentLabel(segmentStatus, dateFrom, dateTo);
    }

    setSending(true);
    try {
      const data = await sendAdminNotification({ title, body, url, sendPush, sendEmail, userId, filters, recipientLabel });
      const parts = [];
      if (sendPush) parts.push(`${data.sent} device${data.sent === 1 ? '' : 's'}`);
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
          Send a real push notification and/or an email, to everyone, one specific client, or a filtered segment.
          Also adds it to the in-app Announcements feed on Account.jsx.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            ['all', 'All Clients'],
            ['specific', 'Specific Client'],
            ['segment', 'Filtered Segment'],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTargetMode(mode)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: `2px solid ${targetMode === mode ? 'var(--admin-accent)' : 'rgba(255,255,255,0.15)'}`,
                background: targetMode === mode ? 'var(--admin-accent)' : 'transparent',
                color: targetMode === mode ? '#fff' : 'var(--admin-muted)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {targetMode === 'specific' && (
          <div style={{ marginBottom: 16 }}>
            {selectedClient ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  padding: '6px 8px 6px 14px',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  {selectedClient.name} <span style={{ color: 'var(--admin-muted)', fontWeight: 400 }}>({selectedClient.email})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setClientSearch('');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer', fontSize: '1rem' }}
                  aria-label="Clear selected client"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <input
                  className="admin-input"
                  style={inputStyle}
                  placeholder="Search client by name or email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                {clientResults.length > 0 && (
                  <div className="admin-card" style={{ marginTop: 8, padding: 8 }}>
                    {clientResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedClient({ id: u.id, name: u.name, email: u.email });
                          setClientResults([]);
                        }}
                        style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: 8, color: '#dbe4ee' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <strong>{u.name}</strong> <span style={{ color: 'var(--admin-muted)' }}>{u.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {targetMode === 'segment' && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <select className="admin-input" style={{ ...inputStyle, width: 160 }} value={segmentStatus} onChange={(e) => setSegmentStatus(e.target.value)}>
              <option value="">Any subscription status</option>
              <option value="free">Free</option>
              <option value="active">Active (Paid)</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
              From{' '}
              <input type="date" className="admin-input" style={{ ...inputStyle, width: 160, display: 'inline-block' }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
              To{' '}
              <input type="date" className="admin-input" style={{ ...inputStyle, width: 160, display: 'inline-block' }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
            <span style={{ color: 'var(--admin-accent)', fontWeight: 700, fontSize: '0.85rem' }}>
              {matchCount === null ? '' : `~${matchCount} client${matchCount === 1 ? '' : 's'} match`}
            </span>
          </div>
        )}

        <input className="admin-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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

        <div style={{ display: 'flex', gap: 20, margin: '4px 0 16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dbe4ee', cursor: 'pointer' }}>
            <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
            Send push notification
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dbe4ee', cursor: 'pointer' }}>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Send email
          </label>
        </div>

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
          {sending ? 'Sending...' : `Send to ${targetMode === 'all' ? 'All' : targetMode === 'specific' ? 'Client' : 'Segment'}`}
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
            <p style={{ margin: '6px 0 0', color: 'var(--admin-muted)', fontSize: '0.75rem' }}>To: {n.recipient_label || 'All clients'}</p>
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
