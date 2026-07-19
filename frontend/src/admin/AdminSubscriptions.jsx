import { useEffect, useState } from 'react';
import { listSubscriptions } from '../lib/adminDb.js';

function planLabel(plan) {
  if (plan === 'annual') return 'Annual ($89.99/yr)';
  if (plan === 'monthly') return 'Monthly ($9.99/mo)';
  return '-';
}

function toCsv(subs) {
  const header = ['Name', 'Email', 'Plan', 'Tier', 'Status', 'Renews'];
  const rows = subs.map((s) => [
    s.name,
    s.email,
    planLabel(s.subscription_plan),
    s.subscription_tier,
    s.subscription_status,
    s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '',
  ]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
}

function downloadCsv(subs) {
  const csv = toCsv(subs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `arabikids-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listSubscriptions().then(setSubs).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ color: '#fff', fontWeight: 900, margin: 0 }}>Subscriptions</h1>
        <button
          onClick={() => downloadCsv(subs)}
          disabled={subs.length === 0}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 800, cursor: subs.length === 0 ? 'not-allowed' : 'pointer', opacity: subs.length === 0 ? 0.5 : 1 }}
        >
          Export CSV
        </button>
      </div>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Plan</th><th>Tier</th><th>Status</th><th>Renews</th></tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{planLabel(s.subscription_plan)}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.subscription_tier}</td>
                <td>{s.subscription_status}</td>
                <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No active subscriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
