import { Link } from 'react-router-dom';
import HudMascot from '../components/HudMascot.jsx';
import LessonWalkthroughAnimation from '../components/LessonWalkthroughAnimation.jsx';
import Seo from '../components/Seo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HowItWorks() {
  const { t } = useLanguage();
  const copy = t('howItWorks');

  return (
    <div>
      <Seo
        title="How It Works | ArabiKids"
        description="See how ArabiKids teaches Arabic and Qur'an together in one continuous journey, with checkpoints and progress tracking every step of the way."
        path="/how-it-works"
      />
      <div className="container" style={{ padding: '60px 0 40px', textAlign: 'center' }}>
        <HudMascot pose="mark" size={64} style={{ marginBottom: 12 }} />
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </div>

      <section style={{ background: '#fff', padding: '20px 0 60px' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {copy.steps.map((step, i) => (
            <div key={step.title} className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--color-blue)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}
              >
                {i + 1}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', color: 'var(--color-blue)' }}>{step.title}</h3>
                <p style={{ margin: 0, color: '#5a6a7a' }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-sky" style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            {copy.levelsTitle}
          </h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            {copy.levelsSubtitle}
          </p>
          <div style={{ maxWidth: 800, margin: '0 auto', overflowX: 'auto' }}>
            <table className="table" style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
              <thead>
                <tr>
                  <th>{copy.tableHeaders.level}</th>
                  <th>{copy.tableHeaders.stages}</th>
                  <th>{copy.tableHeaders.focus}</th>
                </tr>
              </thead>
              <tbody>
                {copy.levels.map((level) => (
                  <tr key={level.name}>
                    <td style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{level.name}</td>
                    <td>{level.stages}</td>
                    <td>{level.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            {copy.sampleTitle}
          </h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            {copy.sampleSubtitle}
          </p>
          <LessonWalkthroughAnimation />
        </div>
      </section>

      <section style={{ background: 'var(--color-green)', color: '#fff', padding: '56px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <HudMascot pose="celebrate" size={80} style={{ marginBottom: 12 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 20 }}>
            {copy.readyTitle}
          </h2>
          <Link to="/signup" className="btn" style={{ background: 'var(--color-gold)', color: '#fff' }}>
            {t('home.startTrial')}
          </Link>
        </div>
      </section>
    </div>
  );
}
