import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Clicking the emailed link lands here with a recovery token in the URL —
    // supabase-js parses it automatically and fires PASSWORD_RECOVERY once
    // the temporary recovery session is established.
    let becameReady = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        becameReady = true;
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        becameReady = true;
        setReady(true);
      }
    });

    const timeout = setTimeout(() => {
      if (!becameReady) setInvalid(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('resetPassword.errorLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('resetPassword.errorMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <HudMascot pose="celebrate" size={64} style={{ margin: '0 auto 12px' }} />
          <h1 className="page-title">{t('resetPassword.updatedTitle')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 20 }}>{t('resetPassword.updatedBody')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
            {t('resetPassword.continueBtn')}
          </button>
        </div>
      </div>
    );
  }

  if (invalid && !ready) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <HudMascot pose="lost" size={64} style={{ margin: '0 auto 12px' }} />
          <h1 className="page-title">{t('resetPassword.expiredTitle')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 20 }}>
            {t('resetPassword.expiredBody')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/forgot-password')}>
            {t('resetPassword.requestNewLink')}
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="container" style={{ padding: 60, textAlign: 'center' }}>{t('resetPassword.verifying')}</div>;
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          {t('resetPassword.title')}
        </h1>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">{t('resetPassword.newPassword')}</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('resetPassword.confirmNewPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? t('resetPassword.updating') : t('resetPassword.updatePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
