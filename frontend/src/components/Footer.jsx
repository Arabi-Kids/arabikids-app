import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-blue)', color: '#fff', marginTop: 60, padding: '32px 0' }}>
      <div
        className="container"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <div style={{ fontWeight: 800 }}>
            Arabi<span style={{ color: 'var(--color-gold-light)' }}>Kids</span>
          </div>
          <div style={{ opacity: 0.85, fontSize: '0.85rem', marginTop: 4 }}>
            Teaching the Language of the Quran — One Kid at a Time.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/privacy" style={{ opacity: 0.85 }}>Privacy Policy</Link>
          <Link to="/terms" style={{ opacity: 0.85 }}>Terms of Use</Link>
          <Link to="/contact" style={{ opacity: 0.85 }}>Contact</Link>
        </div>
      </div>
      <div className="container" style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: 16 }}>
        &copy; {new Date().getFullYear()} ArabiKids. All rights reserved.
      </div>
    </footer>
  );
}
