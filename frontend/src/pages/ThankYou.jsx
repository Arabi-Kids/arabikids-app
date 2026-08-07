import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';
import { fireConversion } from '../lib/ads.js';

export default function ThankYou() {
  const { user } = useAuth();
  const { childProfiles, loading } = useActiveChild();
  const { t } = useLanguage();
  const hasChild = childProfiles.length > 0;
  const steps = t('thankYou.steps');

  useEffect(() => {
    // Guard against double-counting the same signup if this page gets
    // refreshed or revisited (e.g. browser back button).
    if (sessionStorage.getItem('ak_signup_conversion_fired')) return;
    sessionStorage.setItem('ak_signup_conversion_fired', '1');
    fireConversion('signup');
  }, []);

  return (
    <div className="container" style={{ padding: '70px 0', textAlign: 'center' }}>
      <HudMascot pose="celebrate" size={100} style={{ margin: '0 auto 12px' }} />
      <h1 className="page-title">{t('thankYou.welcome', { name: user?.name ? `, ${user.name}` : '' })}</h1>
      <p className="page-subtitle">{t('thankYou.ready')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto 40px' }}>
        {steps.map((step, i) => (
          <div key={i} className="card">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                margin: '0 auto 12px',
              }}
            >
              {i + 1}
            </div>
            <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{step.title}</p>
            <p style={{ color: '#5a6a7a', margin: 0 }}>{step.text}</p>
          </div>
        ))}
      </div>

      {!loading && (
        <Link to={hasChild ? '/lessons' : '/add-child'} className="btn btn-primary">
          {hasChild ? t('thankYou.goToHub') : t('thankYou.addFirstChild')}
        </Link>
      )}
    </div>
  );
}
