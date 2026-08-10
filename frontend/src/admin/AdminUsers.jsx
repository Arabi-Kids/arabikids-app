import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, updateUserSubscriptionStatus } from '../lib/adminDb.js';

/** Best-effort human label for signup_source (see
 * frontend/src/lib/attribution.js for what's actually captured). Prefers
 * UTM campaign data (what a Google/Meta ad would set) over a bare referrer
 * hostname, and falls back to "Direct" when neither is present. */
function formatSource(source) {
  if (!source) return 'Direct';
  if (source.gclid) return `Google Ads${source.utmCampaign ? ` — ${source.utmCampaign}` : ''}`;
  if (source.utmSource) return `${source.utmSource}${source.utmCampaign ? ` — ${source.utmCampaign}` : ''}`;
  if (source.referrer) {
    try {
      return new URL(source.referrer).hostname.replace(/^www\./, '');
    } catch {
      return source.referrer;
    }
  }
  return 'Direct';
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function loadUsers() {
    listUsers({ search, status })
      .then(setUsers)
      .catch((err) => setError(err.message));
  }

  useEffect(loadUsers, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadUsers();
  }

  async function updateStatus(user, subscriptionStatus) {
    try {
      await updateUserSubscriptionStatus(user.id, subscriptionStatus);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Users</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ maxWidth: 260, marginBottom: 0 }}
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input"
          style={{ maxWidth: 200, marginBottom: 0 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="free">Free</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
        <button
          type="submit"
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
        >
          Search
        </button>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Children</th><th>Tier</th><th>Status</th><th>Registered</th><th>Source</th><th>Manual Override</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.children.length > 0 ? u.children.map((c) => c.name).join(', ') : '-'}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.subscription_tier}</td>
                <td>{u.subscription_status}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(u.created_at).toLocaleDateString()}{' '}
                  <span style={{ color: 'var(--admin-muted)' }}>{new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td>{formatSource(u.signup_source)}</td>
                <td>
                  <select
                    className="admin-input"
                    style={{ marginBottom: 0, padding: '6px 10px', width: 150 }}
                    value={u.subscription_status}
                    onChange={(e) => updateStatus(u, e.target.value)}
                  >
                    <option value="free">Free</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </td>
                <td>
                  <Link
                    to={`/admin/notifications?userId=${u.id}&name=${encodeURIComponent(u.name)}&email=${encodeURIComponent(u.email)}`}
                    style={{ color: 'var(--admin-accent)', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Notify
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
