import { useState } from 'react';
import { Link } from 'react-router-dom';
import { functionsApi } from '../lib/functions.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';

export default function ForgotPassword() {
  const { t } = useLanguage();
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
          <h1 className="page-title">{t('forgotPassword.checkEmailTitle')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {t('forgotPassword.checkEmailBody', { email })}
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
          {t('forgotPassword.title')}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          {t('forgotPassword.subtitle')}
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('forgotPassword.email')}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{t('forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
}
