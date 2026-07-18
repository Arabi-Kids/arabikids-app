import { useEffect, useState } from 'react';
import { listUsers, updateUserSubscriptionStatus } from '../lib/adminDb.js';

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
            <tr><th>Name</th><th>Email</th><th>Child</th><th>Status</th><th>Manual Override</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.child_name || '-'}</td>
                <td>{u.subscription_status}</td>
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
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
