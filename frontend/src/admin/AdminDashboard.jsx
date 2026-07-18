import { useEffect, useState } from 'react';
import { getDashboardStats } from '../lib/adminDb.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats().then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Dashboard</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 32 }}>
            {[
              ['Total Users', data.totalUsers],
              ['Paid Subscribers', data.paidSubscribers],
              ['MRR (USD)', `$${data.mrrUsd.toFixed(2)}`],
              ['Past Due', data.pastDueSubscriptions],
              ['Total Lessons', data.totalLessons],
              ['Completed Today', data.lessonsCompletedToday],
            ].map(([label, value]) => (
              <div key={label} className="admin-card">
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--admin-accent)' }}>{value}</div>
                <div style={{ color: 'var(--admin-muted)', fontWeight: 700, fontSize: '0.85rem' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <h3 style={{ marginTop: 0, color: '#fff' }}>Recent Signups</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {data.recentSignups.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.subscription_status}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
