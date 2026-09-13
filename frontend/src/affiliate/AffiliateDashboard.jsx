import { useEffect, useState } from 'react';
import { getMyProfile, getMyReferralStats, getMyCommissionSummary } from '../lib/affiliateDb.js';

function centsToUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AffiliateDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [commission, setCommission] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyProfile()
      .then(async (p) => {
        setProfile(p);
        const [s, c] = await Promise.all([getMyReferralStats(p.id), getMyCommissionSummary(p.id)]);
        setStats(s);
        setCommission(c);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: '#e57373' }}>{error}</p>;
  if (!profile || !stats || !commission) return <p style={{ color: 'var(--admin-muted)' }}>Loading...</p>;

  const referralLink = `${window.location.origin}/signup?ref=${profile.referral_code}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Dashboard</h1>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--admin-muted)', margin: '0 0 8px', fontWeight: 700 }}>Your referral link</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="admin-input" style={{ flex: 1, minWidth: 240, marginBottom: 0 }} readOnly value={referralLink} />
          <button
            type="button"
            onClick={copyLink}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="admin-card">
          <p style={{ color: 'var(--admin-muted)', margin: '0 0 4px' }}>Active referrals</p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>{stats.active}</p>
        </div>
        <div className="admin-card">
          <p style={{ color: 'var(--admin-muted)', margin: '0 0 4px' }}>Current tier</p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>{Math.round(stats.currentTierRate * 100)}%</p>
        </div>
        <div className="admin-card">
          <p style={{ color: 'var(--admin-muted)', margin: '0 0 4px' }}>This month (provisional)</p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>{centsToUsd(commission.currentMonthCents)}</p>
        </div>
        <div className="admin-card">
          <p style={{ color: 'var(--admin-muted)', margin: '0 0 4px' }}>Lifetime earned</p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>{centsToUsd(commission.lifetimeCents)}</p>
        </div>
      </div>

      <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
        Tiers: 1–9 active referrals = 10%, 10–29 = 15%, 30+ = 20%. New referrals get whatever tier you're at when they sign up — earlier
        referrals keep their original rate even after you level up. "This month" is provisional until the 1st of next month, when it's
        finalized into your payout history.
      </p>
    </div>
  );
}
