import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <Seo title="Page Not Found | ArabiKids" path={window.location.pathname} noindex />
      <HudMascot pose="lost" size={110} style={{ margin: '0 auto 12px' }} />
      <h1 className="page-title">{t('notFound.title')}</h1>
      <p className="page-subtitle">{t('notFound.subtitle')}</p>
      <Link to="/" className="btn btn-primary">
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
