import HudMascot from '../components/HudMascot.jsx';
import ZaydMascot from '../components/ZaydMascot.jsx';
import AmalMascot from '../components/AmalMascot.jsx';

const TEAM = [
  { name: 'Founder & Curriculum Lead', role: 'Arabic & Islamic Studies' },
  { name: 'Product & Engineering', role: 'Platform & App' },
  { name: 'Illustration & Design', role: 'Brand & Visuals' },
];

export default function About() {
  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>About ArabiKids</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '0 0 32px' }}>
        <HudMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0s' }} />
        <ZaydMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0.2s' }} />
        <AmalMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Our Story</h3>
        <p style={{ color: '#4b5a6a' }}>
          ArabiKids was born from a simple frustration — Muslim children growing up outside the Arab
          world recite the Quran without understanding a single word. We built ArabiKids to change that.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto 24px' }}>
        <div className="card">
          <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Our Mission</h3>
          <p style={{ color: '#4b5a6a', margin: 0 }}>
            To make Arabic accessible, joyful, and meaningful for every Muslim child — wherever they
            grow up.
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>Our Vision</h3>
          <p style={{ color: '#4b5a6a', margin: 0 }}>
            A generation of Muslim children who don't just recite the Quran — they understand it.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 40px', background: 'var(--color-blue)', color: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>What Makes Us Different</h3>
        <p style={{ margin: 0, opacity: 0.95 }}>
          We don't teach Arabic and Quran separately. Every lesson connects language directly to the
          Book of Allah.
        </p>
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>Our Team</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
        {TEAM.map((member) => (
          <div key={member.name} className="card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--color-gold-light)',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ fontWeight: 800, color: 'var(--color-blue)', margin: '0 0 4px' }}>{member.name}</p>
            <p style={{ color: '#8ea0b6', margin: 0, fontSize: '0.9rem' }}>{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
