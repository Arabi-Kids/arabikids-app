import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { functionsApi } from '../lib/functions.js';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

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
    if (!form.acceptTerms) {
      setError('Please accept the Terms of Use to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await register(form);
      functionsApi.subscribeEnginemailer({ name: form.name, email: form.email }).catch(() => {});
      if (needsEmailConfirmation) {
        setConfirmEmailSent(true);
      } else {
        navigate('/thank-you');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmEmailSent) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Check Your Email</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            We've sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account, then log in to add
            your child's profile and start their first free lesson.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          Create Your Account
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Start with Stage 1 free — no credit card needed.
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Parent Name</label>
            <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <input
              id="acceptTerms"
              type="checkbox"
              style={{ width: 'auto', marginTop: 4 }}
              checked={form.acceptTerms}
              onChange={(e) => update('acceptTerms', e.target.checked)}
            />
            <label htmlFor="acceptTerms" style={{ marginBottom: 0, fontWeight: 400 }}>
              I agree to the{' '}
              <Link to="/terms" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
