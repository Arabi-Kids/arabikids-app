import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './admin/AdminAuthContext.jsx';
import AdminProtectedRoute from './admin/AdminProtectedRoute.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminSubscriptions from './admin/AdminSubscriptions.jsx';
import AdminLessonsManager from './admin/AdminLessonsManager.jsx';

// Completely separate product from the public site: its own auth context,
// its own token storage, its own layout, no shared Navbar/Footer.
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="lessons" element={<AdminLessonsManager />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
