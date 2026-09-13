import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliateAuth } from './AffiliateAuthContext.jsx';

const COUNTRIES = [
  'Malaysia',
  'Singapore',
  'Indonesia',
  'United States',
  'United Kingdom',
  'Australia',
  'Canada',
  'United Arab Emirates',
  'Saudi Arabia',
  'Other',
];

export default function AffiliateRegister() {
  const { register } = useAffiliateAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Malaysia',
    paypalEmail: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  const isMalaysia = form.country === 'Malaysia';

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        country: form.country,
        payoutMethod: isMalaysia ? 'bank_transfer' : 'paypal',
        paypalEmail: form.paypalEmail,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankAccountHolder: form.bankAccountHolder,
      });
      if (needsEmailConfirmation) {
        setConfirmEmailSent(true);
      } else {
        navigate('/affiliate/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmEmailSent) {
    return (
      <div className="admin-login-shell">
        <div className="admin-card" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontWeight: 900 }}>Check your email</h1>
          <p style={{ color: 'var(--admin-muted)' }}>
            We sent a confirmation link to <strong>{form.email}</strong>. Click it, then log in to reach your affiliate dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-card" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#fff' }}>
            Arabi<span style={{ color: 'var(--admin-accent)' }}>Kids</span>
          </div>
          <p style={{ color: 'var(--admin-muted)', margin: '4px 0 0' }}>Become an Affiliate</p>
        </div>
        {error && <p style={{ color: '#e57373', fontWeight: 700, textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="admin-input"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <input
            className="admin-input"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Confirm password"
            required
            minLength={8}
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
          />
          <select className="admin-input" required value={form.country} onChange={(e) => update('country', e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {isMalaysia ? (
            <>
              <input
                className="admin-input"
                placeholder="Bank name"
                required
                value={form.bankName}
                onChange={(e) => update('bankName', e.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Account number"
                required
                value={form.bankAccountNumber}
                onChange={(e) => update('bankAccountNumber', e.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Account holder name"
                required
                value={form.bankAccountHolder}
                onChange={(e) => update('bankAccountHolder', e.target.value)}
              />
            </>
          ) : (
            <input
              className="admin-input"
              type="email"
              placeholder="PayPal email"
              required
              value={form.paypalEmail}
              onChange={(e) => update('paypalEmail', e.target.value)}
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--admin-accent)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Creating account...' : 'Register as an Affiliate'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--admin-muted)' }}>
          Already registered? <Link to="/affiliate/login" style={{ color: 'var(--admin-accent)', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
