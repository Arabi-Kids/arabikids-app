import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCurriculum, renameChildProfile, getNotifications } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';

// Stripe's own hosted Customer Portal login link (Settings -> Billing ->
// Customer portal in the Stripe Dashboard) - customers verify by email on
// Stripe's side, so no app-side session/API call is needed to open it, and
// it already covers cancel + plan-switch once those are enabled for this
// portal configuration.
const STRIPE_PORTAL_LINK = 'https://billing.stripe.com/p/login/28EaEZ2WJ2Ix2EacTZe3e00';

export default function Account() {
  const { user, isPaid, changePassword } = useAuth();
  const { childProfiles, refreshChildren } = useActiveChild();
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [stagesById, setStagesById] = useState({});
  const [editingChildId, setEditingChildId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getCurriculum()
      .then(({ stages }) => {
        setStagesById(Object.fromEntries(stages.map((s) => [s.id, s])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 8) {
      setError(t('account.errorPasswordLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('account.errorPasswordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await changePassword(newPassword);
      setMessage(t('account.passwordUpdated'));
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <HudMascot pose="mark" size={44} />
        <h1 className="page-title" style={{ margin: 0 }}>{t('account.title')}</h1>
      </div>

      {notifications.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{t('account.announcements')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{ borderTop: '1px solid #e0dccd', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>{n.title}</p>
                  <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.8rem' }}>{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                <p style={{ margin: '6px 0 0', color: '#4b5a6a' }}>{n.body}</p>
                {n.url && (
                  <Link to={n.url} style={{ display: 'inline-block', marginTop: 6, color: 'var(--color-blue)', fontWeight: 700 }}>
                    {t('account.learnMore')}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{t('account.profile')}</h3>
        <p><strong>{t('account.parentName')}</strong> {user.name}</p>
        <p><strong>{t('account.email')}</strong> {user.email}</p>
      </div>

      {(error || message) && (
        <p className={error ? 'error-text' : ''} style={{ color: message ? 'var(--color-green)' : undefined, fontWeight: 700 }}>
          {error || message}
        </p>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{t('account.children')}</h3>
        {childProfiles.length === 0 && <p style={{ color: '#5a6a7a' }}>{t('account.noChildren')}</p>}
        {childProfiles.map((child) => (
          <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #ecebe2' }}>
            {editingChildId === child.id ? (
              <>
                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ flex: 1, marginRight: 10 }} />
                <button className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={() => saveRename(child.id)}>
                  {t('account.save')}
                </button>
              </>
            ) : (
              <>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{child.name}</p>
                  <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.85rem' }}>
                    {stagesById[child.currentStageId]
                      ? t('account.stageLabel', { n: stagesById[child.currentStageId].orderIndex, name: stagesById[child.currentStageId].name })
                      : t('account.notYetPlaced')}
                  </p>
                </div>
                <button className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={() => startRename(child)}>
                  {t('account.rename')}
                </button>
              </>
            )}
          </div>
        ))}
        <Link to="/add-child" className="btn btn-outline" style={{ marginTop: 16, display: 'inline-block' }}>
          {t('account.addChild')}
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{t('account.changePassword')}</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="newPassword">{t('account.newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">{t('account.confirmNewPassword')}</label>
            <input
              id="confirmNewPassword"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" type="submit" disabled={loading || !newPassword}>
            {t('account.updatePassword')}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{t('account.subscription')}</h3>
        {user.subscriptionStatus === 'past_due' && (
          <div style={{ background: 'rgba(197,48,48,0.08)', border: '1px solid #c53030', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#c53030' }}>{t('account.pastDueWarning')}</p>
            <p style={{ margin: '6px 0 0', color: '#4b5a6a' }}>
              {t('account.pastDueBody')}{' '}
              <Link to="/checkout?status=failed" style={{ color: '#c53030', fontWeight: 700 }}>
                {t('account.learnMore')}
              </Link>
            </p>
          </div>
        )}
        <p>
          <strong>{t('account.status')}</strong>{' '}
          <span className={isPaid() ? 'badge badge-free' : 'badge badge-locked'}>{user.subscriptionStatus}</span>
        </p>
        <p><strong>{t('account.tier')}</strong> {user.subscriptionTier === 'family' ? t('account.tierFamily') : t('account.tierStandard')}</p>
        {user.subscriptionPlan && (
          <p><strong>{t('account.plan')}</strong> {user.subscriptionPlan === 'annual' ? t('account.planAnnual') : t('account.planMonthly')}</p>
        )}
        {user.currentPeriodEnd && (
          <p><strong>{t('account.renews')}</strong> {new Date(user.currentPeriodEnd).toLocaleDateString()}</p>
        )}

        {isPaid() ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              className="btn btn-outline"
              href={`${STRIPE_PORTAL_LINK}?prefilled_email=${encodeURIComponent(user.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('account.manageSubscription')}
            </a>
          </div>
        ) : (
          <Link to="/pricing" className="btn btn-primary">
            {t('account.upgradeNow')}
          </Link>
        )}
      </div>
    </div>
  );
}
