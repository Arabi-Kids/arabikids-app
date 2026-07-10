import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Arabi<span style={{ color: 'var(--admin-accent)' }}>Kids</span> Admin
        </div>
        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>Users</NavLink>
        <NavLink to="/admin/subscriptions" className={({ isActive }) => (isActive ? 'active' : '')}>Subscriptions</NavLink>
        <NavLink to="/admin/lessons" className={({ isActive }) => (isActive ? 'active' : '')}>Lessons Manager</NavLink>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#dbe4ee',
            padding: '10px 14px',
            borderRadius: 10,
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Log Out
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
