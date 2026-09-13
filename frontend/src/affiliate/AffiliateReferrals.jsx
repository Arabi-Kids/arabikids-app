import { useEffect, useState } from 'react';
import { getMyProfile, listMyReferrals } from '../lib/affiliateDb.js';

const STATUS_LABELS = { pending: 'Pending', active: 'Active', expired: 'Expired' };

export default function AffiliateReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => listMyReferrals(p.id))
      .then((rows) => {
        setReferrals(rows);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Referrals</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Referred</th><th>Status</th><th>Rate</th><th>Months remaining</th></tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{STATUS_LABELS[r.status]}</td>
                <td>{Math.round(r.commission_tier_at_signup * 100)}%</td>
                <td>{r.monthsRemaining === null ? '—' : `${r.monthsRemaining} mo`}</td>
              </tr>
            ))}
            {loaded && referrals.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No referrals yet — share your link to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
