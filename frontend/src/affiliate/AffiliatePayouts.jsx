import { useEffect, useState } from 'react';
import { getMyProfile, getMyPayoutHistory } from '../lib/affiliateDb.js';

export default function AffiliatePayouts() {
  const [payouts, setPayouts] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => getMyPayoutHistory(p.id))
      .then((rows) => {
        setPayouts(rows);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Payouts</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Period</th><th>Amount</th><th>Status</th><th>Sent</th></tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.period_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                <td>${(p.amount_cents / 100).toFixed(2)}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.status}</td>
                <td>{p.sent_at ? new Date(p.sent_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {loaded && payouts.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No payouts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
