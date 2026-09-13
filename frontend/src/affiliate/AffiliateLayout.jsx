import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAffiliateAuth } from './AffiliateAuthContext.jsx';

// Reuses the admin portal's shell CSS classes (.admin-shell/.admin-sidebar/
// .admin-main etc, index.css) - generic internal-portal chrome, not
// admin-specific despite the class names, so a third portal doesn't need its
// own CSS written from scratch.
export default function AffiliateLayout() {
  const { logout } = useAffiliateAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/affiliate/login');
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${navOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            Arabi<span style={{ color: 'var(--admin-accent)' }}>Kids</span> Affiliates
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
          <NavLink to="/affiliate/dashboard" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/affiliate/referrals" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Referrals</NavLink>
          <NavLink to="/affiliate/payouts" onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : '')}>Payouts</NavLink>
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
