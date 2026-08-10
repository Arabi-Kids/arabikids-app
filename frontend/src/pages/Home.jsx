import { Link } from 'react-router-dom';
import HeroAnimation from '../components/HeroAnimation.jsx';
import { BookIcon, PathIcon, TargetIcon, DeviceIcon, StarSparkleIcon } from '../components/Icons.jsx';
import Seo from '../components/Seo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const FEATURE_ICONS = [BookIcon, PathIcon, TargetIcon, DeviceIcon, StarSparkleIcon];
const FEATURE_ACCENTS = ['var(--color-blue)', 'var(--color-teal)', 'var(--color-gold)', 'var(--color-orange)', 'var(--color-purple)'];

export default function Home() {
  const { t } = useLanguage();
  const levels = t('home.levels');
  const levelSamples = t('home.levelSamples');
  const features = t('home.features');
  const steps = t('home.steps');
  const testimonials = t('home.testimonials');
  const trustStrip = t('home.trustStrip');

  return (
    <div>
      <Seo
        title="ArabiKids - Teaching the Language of the Quran, One Kid at a Time"
        description="ArabiKids teaches Arabic and Qur'an together, never separately, so every child understands what they recite. 16 stages, ages 3-17, Stage 1 free."
        path="/"
      />
      <section className="hero-section">
        <div className="hero-star-field" aria-hidden="true"></div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">{t('home.heroKicker')}</span>
            <h1 className="hero-h1">
              {t('home.heroLine1')}
              <br />
              {t('home.heroLine2Pre') ? `${t('home.heroLine2Pre')} ` : ''}
              <span className="hero-h1-accent">{t('home.heroLine2Accent')}</span>
              <br />
              {t('home.heroLine3')}
            </h1>
            <p className="hero-sub">{t('home.heroSub')}</p>
            <div className="hero-ctas">
              <Link to="/signup" className="btn btn-primary btn-chunky">
                {t('home.startTrial')}
              </Link>
              <Link to="/how-it-works" className="btn btn-outline btn-chunky">
                {t('home.seeHow')}
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <HeroAnimation />
          </div>
        </div>
        <div className="hero-arch" aria-hidden="true">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none">
            <path
              d="M0 40 L0 18 Q25 0 50 18 Q75 0 100 18 Q125 0 150 18 Q175 0 200 18 Q225 0 250 18 Q275 0 300 18 Q325 0 350 18 Q375 0 400 18 L400 40 Z"
              fill="var(--color-blue-dark)"
            />
          </svg>
        </div>
      </section>

      <section style={{ background: 'var(--color-blue-dark)', padding: '22px 0' }}>
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, textAlign: 'center' }}
        >
          {trustStrip.map(([stat, label]) => (
            <div key={label}>
              <div style={{ color: 'var(--color-gold-light)', fontWeight: 900, fontSize: '1.2rem' }}>{stat}</div>
              <div style={{ color: '#dbe4ee', fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '60px 0' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          {t('home.levelsTitle')}
        </h2>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          {t('home.levelsSubtitle')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {levels.map((level, i) => (
            <div key={level.name} className="card">
              <span className="badge badge-free" style={{ marginBottom: 12 }}>{level.desc}</span>
              <h3 style={{ color: 'var(--color-blue)', margin: '4px 0 8px' }}>{level.name}</h3>
              <p className="arabic-text" dir="rtl" style={{ color: '#8ea0b6', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                {levelSamples[i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            {t('home.featuresTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              const accent = FEATURE_ACCENTS[i];
              return (
                <div key={f.title} className="card card-kid" style={{ '--card-accent': accent, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--color-sky)',
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}
                  >
                    <Icon style={{ width: 26, height: 26 }} />
                  </div>
                  <h3 style={{ color: 'var(--color-blue)', margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ color: '#5a6a7a', margin: 0 }}>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-sky)', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            {t('home.reviewHubTitle')}
          </h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            {t('home.reviewHubSubtitle')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div className="card">
              <span className="badge badge-gold" style={{ marginBottom: 12 }}>{t('home.watchTag')}</span>
              <h3 style={{ color: 'var(--color-blue)', margin: '4px 0 10px' }}>{t('home.watchTitle')}</h3>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-blue-dark)',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.4rem',
                  }}
                >
                  ▶
                </div>
                <span
                  className="arabic-text"
                  dir="rtl"
                  style={{ position: 'absolute', bottom: 10, insetInlineStart: 14, color: 'var(--color-gold-light)', fontWeight: 700 }}
                >
                  بِسْمِ اللَّٰهِ
                </span>
              </div>
              <p style={{ color: '#5a6a7a', margin: 0 }}>{t('home.watchDesc')}</p>
            </div>
            <div className="card">
              <span className="badge badge-gold" style={{ marginBottom: 12 }}>{t('home.playTag')}</span>
              <h3 style={{ color: 'var(--color-blue)', margin: '4px 0 10px' }}>{t('home.playTitle')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div
                  className="arabic-text"
                  dir="rtl"
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-gold)',
                    background: 'rgba(200,150,12,0.08)',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  كِتَاب
                </div>
                <div
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-gold)',
                    background: 'rgba(200,150,12,0.08)',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {t('home.playWordBook')}
                </div>
                <div
                  className="arabic-text"
                  dir="rtl"
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-blue)',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    opacity: 0.6,
                  }}
                >
                  بَيْت
                </div>
                <div
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-blue)',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    opacity: 0.6,
                  }}
                >
                  {t('home.playWordHouse')}
                </div>
              </div>
              <p style={{ color: '#5a6a7a', margin: 0 }}>{t('home.playDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '60px 0' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          {t('home.howTitle')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={s.title} className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--color-blue)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  margin: '0 auto 16px',
                }}
              >
                {i + 1}
              </div>
              <h3 style={{ color: 'var(--color-blue)', margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ color: '#5a6a7a', margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            {t('home.testimonialsTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {testimonials.map((tm, i) => (
              <div key={i} className="card">
                <p style={{ color: '#4b5a6a', fontStyle: 'italic', marginTop: 0 }}>&ldquo;{tm.quote}&rdquo;</p>
                <p style={{ color: 'var(--color-blue)', fontWeight: 800, margin: 0 }}>{tm.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-green)', color: '#fff', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
            {t('home.ctaTitle')}
          </h2>
          <p style={{ maxWidth: 600, margin: '0 auto 28px', opacity: 0.9 }}>
            {t('home.ctaSub')}
          </p>
          <Link to="/signup" className="btn btn-chunky" style={{ background: 'var(--color-gold)', color: '#fff', boxShadow: '0 5px 0 #8a6708' }}>
            {t('home.startTrial')}
          </Link>
        </div>
      </section>
    </div>
  );
}
