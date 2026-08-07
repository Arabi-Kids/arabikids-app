import { Link } from 'react-router-dom';
import HudMascot from './HudMascot.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ background: 'var(--color-blue)', color: '#fff', marginTop: 60, padding: '32px 0' }}>
      <div
        className="container"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HudMascot pose="mark" size={30} style={{ opacity: 0.9 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Arabi<span style={{ color: 'var(--color-gold-light)' }}>Kids</span>
            </div>
            <div style={{ opacity: 0.85, fontSize: '0.85rem', marginTop: 4 }}>
              {t('footer.tagline')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/privacy" style={{ opacity: 0.85 }}>{t('footer.privacy')}</Link>
          <Link to="/terms" style={{ opacity: 0.85 }}>{t('footer.terms')}</Link>
          <Link to="/contact" style={{ opacity: 0.85 }}>{t('footer.contact')}</Link>
        </div>
      </div>
      <div
        className="container"
        style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}
      >
        <span>&copy; {new Date().getFullYear()} ArabiKids. {t('footer.rights')}</span>
        <span>
          {t('footer.websiteBy')}{' '}
          <a href="https://techlabagency.online/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            TechLab
          </a>
        </span>
      </div>
    </footer>
  );
}
