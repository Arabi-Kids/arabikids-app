import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const group = user?.ageGroup || 'junior';

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar-header">
      <div className="container navbar-inner">
        <Link to="/" style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-blue)' }} onClick={closeMenu}>
          Arabi<span style={{ color: 'var(--color-gold)' }}>Kids</span>
        </Link>

        <button
          className="navbar-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/how-it-works" onClick={closeMenu}>How it Works</Link>
          <Link to="/pricing" onClick={closeMenu}>Pricing</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          {user && <Link to={`/lessons/${group}`} onClick={closeMenu}>Lessons</Link>}
          {user && <Link to="/progress" onClick={closeMenu}>Progress</Link>}
          {user ? (
            <>
              <Link to="/account" onClick={closeMenu}>Account</Link>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Log in</Link>
              <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
