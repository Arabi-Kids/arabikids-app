import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const group = user?.ageGroup || 'junior';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header
      style={{
        background: '#fff',
        boxShadow: '0 2px 12px rgba(27,79,138,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, flexWrap: 'wrap' }}
      >
        <Link to="/" style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-blue)' }}>
          Arabi<span style={{ color: 'var(--color-gold)' }}>Kids</span>
        </Link>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {user && <Link to={`/lessons/${group}`}>Lessons</Link>}
          {user && <Link to="/progress">Progress</Link>}
          {user ? (
            <>
              <Link to="/account">Account</Link>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
