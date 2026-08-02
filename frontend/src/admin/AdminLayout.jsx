import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  // Below 780px the sidebar collapses into a top bar with a hamburger toggle
  // (see .admin-nav-toggle/.admin-nav-links in index.css) instead of staying
  // a horizontally-scrolling strip with no visible affordance to scroll.
  const [navOpen, setNavOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${navOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            Arabi<span style={{ color: 'var(--admin-accent)' }}>Kids</span> Admin
          </div>
          <button
            type="button"
            className="admin-nav-toggle"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? '✕' : '☰'}
          </button>
        </div>
        <nav className="admin-nav-links">
          <NavLink to="/admin/dashboard" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/admin/users" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Users</NavLink>
          <NavLink to="/admin/subscriptions" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Subscriptions</NavLink>
          <NavLink to="/admin/lessons" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Lessons Manager</NavLink>
          <NavLink to="/admin/support" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Support</NavLink>
          <NavLink to="/admin/notifications" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Notifications</NavLink>
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
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
