import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from './HudMascot.jsx';
import { isMuted, setMuted, playTap } from '../lib/sounds.js';

const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'ms', flag: '🇲🇾', label: 'Bahasa Melayu' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { childProfiles, activeChildId, setActiveChildId } = useActiveChild();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playTap();
  }

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
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-blue)' }}
          onClick={closeMenu}
        >
          <HudMascot pose="mark" size={34} />
          Arabi<span style={{ color: 'var(--color-gold)' }}>Kids</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 4,
              color: 'var(--color-blue)',
              fontWeight: 700,
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            onClick={toggleSound}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.3rem',
              lineHeight: 1,
              padding: 4,
              color: 'var(--color-blue)',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            className="navbar-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/how-it-works" onClick={closeMenu}>{t('nav.howItWorks')}</Link>
          <Link to="/pricing" onClick={closeMenu}>{t('nav.pricing')}</Link>
          <Link to="/about" onClick={closeMenu}>{t('nav.about')}</Link>
          <Link to="/contact" onClick={closeMenu}>{t('nav.contact')}</Link>
          <Link to="/lessons" onClick={closeMenu}>{t('nav.lessons')}</Link>
          {user && <Link to="/progress" onClick={closeMenu}>{t('nav.progress')}</Link>}
          {user && childProfiles.length > 1 && (
            <select
              aria-label="Active child"
              value={activeChildId ?? ''}
              onChange={(e) => setActiveChildId(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '2px solid #e0dccd' }}
            >
              {childProfiles.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          )}
          {user ? (
            <>
              <Link to="/account" onClick={closeMenu}>{t('nav.account')}</Link>
              <button className="btn btn-outline" onClick={handleLogout}>
                {t('nav.logOut')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>{t('nav.logIn')}</Link>
              <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
