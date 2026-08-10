import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { functionsApi } from '../lib/functions.js';
import HudMascot from '../components/HudMascot.jsx';
import Seo from '../components/Seo.jsx';

export default function Signup() {
  const { register } = useAuth();
  const { t } = useLanguage();
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
      setError(t('signup.errorPasswordMismatch'));
      return;
    }
    if (!form.acceptTerms) {
      setError(t('signup.errorAcceptTerms'));
      return;
    }

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await register(form);
      functionsApi.subscribeEnginemailer({ name: form.name, email: form.email }).catch(() => {});
      functionsApi.sendWelcomeEmail(form.name, form.email).catch(() => {});
      functionsApi.notifyAdminSignup(form.name, form.email).catch(() => {});
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
          <HudMascot pose="celebrate" size={64} style={{ margin: '0 auto 12px' }} />
          <h1 className="page-title">{t('signup.checkEmailTitle')}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {t('signup.checkEmailBody', { email: form.email })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Seo
        title="Sign Up Free | ArabiKids"
        description="Create your free ArabiKids parent account. Stage 1 is free for every child, no credit card required."
        path="/signup"
      />
      <div className="card auth-card">
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          {t('signup.title')}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          {t('signup.subtitle')}
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('signup.parentName')}</label>
            <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('signup.email')}</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('signup.password')}</label>
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
            <label htmlFor="confirmPassword">{t('signup.confirmPassword')}</label>
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
              {t('signup.agreeToPrefix')}{' '}
              <Link to="/terms" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
                {t('signup.termsOfUse')}
              </Link>{' '}
              {t('signup.and')}{' '}
              <Link to="/privacy" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
                {t('signup.privacyPolicy')}
              </Link>
              .
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? t('signup.creating') : t('signup.signUp')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          {t('signup.haveAccount')} <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{t('signup.logIn')}</Link>
        </p>
      </div>
    </div>
  );
}
