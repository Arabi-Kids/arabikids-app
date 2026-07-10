import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client';

export default function Account() {
  const { user, token, isPaid } = useAuth();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subscriptions/status', token).then(setStatus).catch((err) => setError(err.message));
  }, [token]);

  async function handleCancel() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await api.post('/subscriptions/cancel', {}, token);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      setMessage('A password reset link has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '48px 0', maxWidth: 560 }}>
      <h1 className="page-title">My Account</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Profile</h3>
        <p><strong>Parent Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.childName && <p><strong>Child:</strong> {user.childName} ({user.ageGroup})</p>}
      </div>

      {(error || message) && (
        <p className={error ? 'error-text' : ''} style={{ color: message ? 'var(--color-green)' : undefined, fontWeight: 700 }}>
          {error || message}
        </p>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Change Password</h3>
        <p style={{ color: '#5a6a7a' }}>We'll email you a secure link to reset your password.</p>
        <button className="btn btn-outline" onClick={handleChangePassword} disabled={loading}>
          Send Password Reset Email
        </button>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Subscription</h3>
        <p>
          <strong>Status:</strong>{' '}
          <span className={isPaid() ? 'badge badge-free' : 'badge badge-locked'}>
            {status?.status || user.subscriptionStatus}
          </span>
        </p>
        {status?.plan && <p><strong>Plan:</strong> {status.plan === 'annual' ? 'Annual ($89.99/yr)' : 'Monthly ($9.99/mo)'}</p>}
        {status?.currentPeriodEnd && (
          <p><strong>Renews:</strong> {new Date(status.currentPeriodEnd).toLocaleDateString()}</p>
        )}
        {isPaid() ? (
          <button className="btn btn-outline" onClick={handleCancel} disabled={loading}>
            {loading ? 'Working...' : 'Cancel Subscription'}
          </button>
        ) : (
          <Link to="/pricing" className="btn btn-primary">
            Upgrade Now
          </Link>
        )}
      </div>
    </div>
  );
}
