import { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { api } from '../api/client';

export default function AdminSubscriptions() {
  const { token } = useAdminAuth();
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/subscriptions', token).then((data) => setSubs(data.subscriptions)).catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Subscriptions</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Renews</th></tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {s.subscription_plan === 'annual' ? 'Annual ($89.99/yr)' : s.subscription_plan === 'monthly' ? 'Monthly ($9.99/mo)' : '-'}
                </td>
                <td>{s.subscription_status}</td>
                <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No active subscriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
