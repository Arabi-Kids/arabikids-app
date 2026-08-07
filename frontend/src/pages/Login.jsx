import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';
import Seo from '../components/Seo.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/lessons');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <Seo title="Log In | ArabiKids" description="Log in to your ArabiKids account to continue your child's Arabic and Qur'an journey." path="/login" />
      <div className="card auth-card">
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          {t('login.title')}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          {t('login.subtitle')}
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? t('login.loggingIn') : t('login.logIn')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{t('login.forgotPassword')}</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8 }}>
          {t('login.noAccount')} <Link to="/signup" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{t('login.signUp')}</Link>
        </p>
      </div>
    </div>
  );
}
