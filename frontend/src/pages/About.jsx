import HudMascot from '../components/HudMascot.jsx';
import ZaydMascot from '../components/ZaydMascot.jsx';
import AmalMascot from '../components/AmalMascot.jsx';
import Seo from '../components/Seo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function About() {
  const { t } = useLanguage();
  const copy = t('about');

  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <Seo
        title="About Us | ArabiKids"
        description="ArabiKids was built to help Muslim children growing up outside the Arab world understand the Arabic and Qur'an they recite."
        path="/about"
      />
      <h1 className="page-title" style={{ textAlign: 'center' }}>{copy.title}</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '0 0 32px' }}>
        <HudMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0s' }} />
        <ZaydMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0.2s' }} />
        <AmalMascot pose="hero" size={90} className="mascot-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
        <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{copy.storyTitle}</h3>
        <p style={{ color: '#4b5a6a' }}>{copy.storyText}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto 24px' }}>
        <div className="card">
          <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{copy.missionTitle}</h3>
          <p style={{ color: '#4b5a6a', margin: 0 }}>{copy.missionText}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-blue)', marginTop: 0 }}>{copy.visionTitle}</h3>
          <p style={{ color: '#4b5a6a', margin: 0 }}>{copy.visionText}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 40px', background: 'var(--color-blue)', color: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>{copy.differentTitle}</h3>
        <p style={{ margin: 0, opacity: 0.95 }}>{copy.differentText}</p>
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>{copy.teamTitle}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
        {copy.team.map((member) => (
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
