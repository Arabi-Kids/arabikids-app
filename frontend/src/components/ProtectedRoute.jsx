import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) return <div className="container" style={{ padding: 60 }}>{t('common.loading')}</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
