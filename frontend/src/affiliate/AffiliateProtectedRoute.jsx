import { Navigate } from 'react-router-dom';
import { useAffiliateAuth } from './AffiliateAuthContext.jsx';

export default function AffiliateProtectedRoute({ children }) {
  const { affiliate, loading } = useAffiliateAuth();

  if (loading) return <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!affiliate) return <Navigate to="/affiliate/login" replace />;

  return children;
}
