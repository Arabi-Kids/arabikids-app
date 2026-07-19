import { useState } from 'react';
import { Link } from 'react-router-dom';
import { functionsApi } from '../lib/functions.js';
import HudMascot from '../components/HudMascot.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await functionsApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px' }} />
          <h1 className="page-title">Check Your Email</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          Forgot Password
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Enter your email and we'll send you a link to reset it.
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
