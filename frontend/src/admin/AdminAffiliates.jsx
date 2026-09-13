import { Fragment, useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import {
  listAffiliates,
  listReferrals,
  listPendingPayouts,
  markPayoutSent,
  updateAffiliateStatus,
} from '../lib/adminDb.js';

function centsToUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function AffiliatesTab() {
  const { admin } = useAdminAuth();
  const [affiliates, setAffiliates] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [payouts, setPayouts] = useState([]);

  function loadAffiliates() {
    listAffiliates({ search }).then(setAffiliates).catch((err) => setError(err.message));
  }

  useEffect(loadAffiliates, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadAffiliates();
  }

  async function toggleExpand(affiliate) {
    if (expandedId === affiliate.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(affiliate.id);
    try {
      setPayouts(await listPendingPayouts(affiliate.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkSent(payoutId) {
    try {
      await markPayoutSent(payoutId, admin.id);
      setPayouts(await listPendingPayouts(expandedId));
      loadAffiliates();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleStatus(affiliate) {
    try {
      await updateAffiliateStatus(affiliate.id, affiliate.status === 'active' ? 'disabled' : 'active');
      loadAffiliates();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ maxWidth: 280, marginBottom: 0 }}
          placeholder="Search name, email, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <tr><th>Name</th><th>Email</th><th>Country</th><th>Code</th><th>Active refs</th><th>Tier</th><th>Owed</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <Fragment key={a.id}>
                <tr>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.country}</td>
                  <td style={{ fontFamily: 'monospace' }}>{a.referral_code}</td>
                  <td>{a.activeReferralCount}</td>
                  <td>{Math.round(a.currentTierRate * 100)}%</td>
                  <td>{centsToUsd(a.pendingPayoutCents)}</td>
                  <td>{a.status}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(a)}
                      style={{ marginRight: 10, background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Payouts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(a)}
                      style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {a.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
                {expandedId === a.id && (
                  <tr>
                    <td colSpan={9} style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {payouts.length === 0 ? (
                        <p style={{ margin: '8px 0', color: 'var(--admin-muted)' }}>No pending payouts.</p>
                      ) : (
                        payouts.map((p) => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                            <span>{new Date(p.period_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            <span>{centsToUsd(p.amount_cents)}</span>
                            <span>{p.status}</span>
                            {p.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleMarkSent(p.id)}
                                style={{ background: 'none', border: '1px solid var(--admin-accent)', color: 'var(--admin-accent)', borderRadius: 8, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Mark sent
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {affiliates.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No affiliates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ['', 'pending', 'active', 'expired'];

function ReferralsTab() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function loadReferrals() {
    listReferrals({ search, status }).then(setReferrals).catch((err) => setError(err.message));
  }

  useEffect(loadReferrals, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadReferrals();
  }

  return (
    <div>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ maxWidth: 260, marginBottom: 0 }}
          placeholder="Search affiliate or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input" style={{ maxWidth: 180, marginBottom: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'all'} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}</option>
          ))}
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
            <tr><th>Customer</th><th>Affiliate</th><th>Started</th><th>Tier</th><th>Months remaining</th><th>Status</th></tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id}>
                <td>{r.maskedCustomerEmail}</td>
                <td>{r.affiliateName}</td>
                <td>{r.commission_start_date ? new Date(r.commission_start_date).toLocaleDateString() : '—'}</td>
                <td>{Math.round(r.commission_tier_at_signup * 100)}%</td>
                <td>{r.monthsRemaining === null ? '—' : `${r.monthsRemaining} mo`}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.status}</td>
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No referrals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminAffiliates() {
  const [tab, setTab] = useState('affiliates');

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Affiliates</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['affiliates', 'referrals'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: `1px solid ${tab === t ? 'var(--admin-accent)' : 'rgba(255,255,255,0.15)'}`,
              background: tab === t ? 'var(--admin-accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--admin-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'affiliates' ? <AffiliatesTab /> : <ReferralsTab />}
    </div>
  );
}
