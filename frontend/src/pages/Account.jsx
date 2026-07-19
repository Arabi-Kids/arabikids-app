import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { functionsApi } from '../lib/functions.js';
import { getCurriculum, renameChildProfile } from '../lib/db.js';

export default function Account() {
  const { user, isPaid, changePassword } = useAuth();
  const { childProfiles, refreshChildren } = useActiveChild();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [stagesById, setStagesById] = useState({});
  const [editingChildId, setEditingChildId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    getCurriculum()
      .then(({ stages }) => {
        setStagesById(Object.fromEntries(stages.map((s) => [s.id, s])));
      })
      .catch(() => {});
  }, []);

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

  function startRename(child) {
    setEditingChildId(child.id);
    setEditingName(child.name);
  }

  async function saveRename(childId) {
    try {
      await renameChildProfile(childId, editingName);
      setEditingChildId(null);
      await refreshChildren();
    } catch (err) {
      setError(err.message);
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
      </div>

      {(error || message) && (
        <p className={error ? 'error-text' : ''} style={{ color: message ? 'var(--color-green)' : undefined, fontWeight: 700 }}>
          {error || message}
        </p>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Children</h3>
        {childProfiles.length === 0 && <p style={{ color: '#5a6a7a' }}>No children added yet.</p>}
        {childProfiles.map((child) => (
          <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #ecebe2' }}>
            {editingChildId === child.id ? (
              <>
                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ flex: 1, marginRight: 10 }} />
                <button className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={() => saveRename(child.id)}>
                  Save
                </button>
              </>
            ) : (
              <>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{child.name}</p>
                  <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.85rem' }}>
                    {stagesById[child.currentStageId]
                      ? `Stage ${stagesById[child.currentStageId].orderIndex}: ${stagesById[child.currentStageId].name}`
                      : 'Not yet placed'}
                    {' · '}🔥 {child.currentStreak} day streak
                  </p>
                </div>
                <button className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={() => startRename(child)}>
                  Rename
                </button>
              </>
            )}
          </div>
        ))}
        <Link to="/add-child" className="btn btn-outline" style={{ marginTop: 16, display: 'inline-block' }}>
          + Add a Child
        </Link>
      </div>

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
        <p><strong>Tier:</strong> {user.subscriptionTier === 'family' ? 'Family (multiple children)' : 'Standard (1 child)'}</p>
        {user.subscriptionPlan && (
          <p><strong>Plan:</strong> {user.subscriptionPlan === 'annual' ? 'Annual' : 'Monthly'}</p>
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
