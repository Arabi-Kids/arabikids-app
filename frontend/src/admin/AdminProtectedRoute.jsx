import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
