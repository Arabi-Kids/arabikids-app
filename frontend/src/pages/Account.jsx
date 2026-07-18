import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { functionsApi } from '../lib/functions.js';

export default function Account() {
  const { user, isPaid, changePassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  async function handleCancel() {
    setError('');
    setMessage('');
    setLoading(true);
    setShowCancelConfirm(false);
    try {
      const data = await functionsApi.cancelSubscription();
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBillingPortal() {
    setError('');
    setLoading(true);
    try {
      const { url } = await functionsApi.billingPortal();
      if (!url) throw new Error('Could not open billing portal.');
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(newPassword);
      setMessage('Your password has been updated.');
      setNewPassword('');
      setConfirmPassword('');
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
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" type="submit" disabled={loading || !newPassword}>
            Update Password
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Subscription</h3>
        <p>
          <strong>Status:</strong>{' '}
          <span className={isPaid() ? 'badge badge-free' : 'badge badge-locked'}>{user.subscriptionStatus}</span>
        </p>
        {user.subscriptionPlan && (
          <p><strong>Plan:</strong> {user.subscriptionPlan === 'annual' ? 'Annual ($89.99/yr)' : 'Monthly ($9.99/mo)'}</p>
        )}
        {user.currentPeriodEnd && (
          <p><strong>Renews:</strong> {new Date(user.currentPeriodEnd).toLocaleDateString()}</p>
        )}

        {isPaid() ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={handleBillingPortal} disabled={loading}>
              Manage Billing
            </button>
            {showCancelConfirm ? (
              <>
                <span style={{ alignSelf: 'center', fontWeight: 700 }}>Cancel at period end?</span>
                <button className="btn btn-primary" onClick={handleCancel} disabled={loading}>
                  {loading ? 'Working...' : 'Yes, Cancel'}
                </button>
                <button className="btn btn-outline" onClick={() => setShowCancelConfirm(false)} disabled={loading}>
                  Never Mind
                </button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => setShowCancelConfirm(true)} disabled={loading}>
                Cancel Subscription
              </button>
            )}
          </div>
        ) : (
          <Link to="/pricing" className="btn btn-primary">
            Upgrade Now
          </Link>
        )}
      </div>
    </div>
  );
}
