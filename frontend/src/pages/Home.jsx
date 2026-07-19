import { Link } from 'react-router-dom';

const TRUST_STRIP = [
  ['16', 'Stages, One Journey'],
  ['~150', 'Lessons'],
  ['Ages 3-17', 'Beginner to Advanced'],
  ['Malaysia & Global', 'Muslim Families Everywhere'],
];

const FEATURES = [
  { icon: '📖', title: 'Quran-Connected', text: 'Every letter and word links directly to a Quranic verse or name of Allah.' },
  { icon: '🎈', title: 'One Continuous Path', text: 'From first letters to fluent reading — no separate tracks, just the right stage for your child.' },
  { icon: '🎯', title: 'Interactive', text: 'Every stage ends in a checkpoint review, not passive video watching.' },
  { icon: '📱', title: 'Any Device', text: 'Works on phone, tablet or laptop, so kids can learn wherever you are.' },
];

const LEVELS = [
  { name: 'Beginner', desc: 'Letters & Sounds', sample: 'Letter ب (baa) → بِسْمِ → Surah Al-Fatihah 1:1' },
  { name: 'Elementary', desc: 'Words Take Shape', sample: 'كِتَاب (book) → often refers to the Quran' },
  { name: 'Intermediate', desc: 'Grammar Foundations', sample: 'رَبِّ الْعَالَمِينَ → "Lord of the worlds" → Al-Fatihah 1:2' },
  { name: 'Advanced', desc: 'Verbs, Sentences & Application', sample: 'إِيَّاكَ نَعْبُدُ → "You alone we worship" → Al-Fatihah 1:5' },
];

const STEPS = [
  { num: 1, title: 'Add Your Child', text: 'Create a free parent account and add a profile for each child — every child gets their own stage and progress.' },
  { num: 2, title: 'Learn Arabic & Quran Together', text: 'Every lesson teaches a concept, an Arabic word, and its Quranic connection — never separately.' },
  { num: 3, title: 'Practice & Progress', text: 'Every few lessons, a quick checkpoint reviews what\'s been learned while parents track streaks and scores.' },
];

const TESTIMONIALS = [
  { quote: 'My daughter now recognises words from Surah Al-Fatihah in her own reading. It finally clicked.', name: 'Parent, Beginner level' },
  { quote: 'Finally a curriculum that doesn\'t treat Arabic and Quran as two separate subjects.', name: 'Parent, Intermediate level' },
  { quote: 'Madinah Book 1 made simple and fun for my teenager. He asks to do lessons now.', name: 'Parent, Advanced level' },
];

export default function Home() {
  return (
    <div>
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)',
          color: '#fff',
          padding: '90px 0 70px',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '16px 0' }}>
            Arabi<span style={{ color: 'var(--color-gold-light)' }}>Kids</span>
          </h1>
          <p style={{ fontSize: '1.3rem', maxWidth: 640, margin: '0 auto 8px', fontWeight: 700 }}>
            Teaching the Language of the Quran — One Kid at a Time.
          </p>
          <p style={{ fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 32px', opacity: 0.9 }}>
            ArabiKids teaches Arabic and Quran together, never separately, so every child understands
            what they recite.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary">
              Start Free Trial
            </Link>
            <Link to="/how-it-works" className="btn" style={{ background: '#fff', color: 'var(--color-blue)' }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-blue-dark)', padding: '22px 0' }}>
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, textAlign: 'center' }}
        >
          {TRUST_STRIP.map(([stat, label]) => (
            <div key={label}>
              <div style={{ color: 'var(--color-gold-light)', fontWeight: 900, fontSize: '1.2rem' }}>{stat}</div>
              <div style={{ color: '#dbe4ee', fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '60px 0' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          Four Levels, One Journey
        </h2>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Every child starts at the stage that fits them, then moves through the same continuous path —
          no separate tracks to choose between.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {LEVELS.map((level) => (
            <div key={level.name} className="card">
              <span className="badge badge-free" style={{ marginBottom: 12 }}>{level.desc}</span>
              <h3 style={{ color: 'var(--color-blue)', margin: '4px 0 8px' }}>{level.name}</h3>
              <p className="arabic-text" dir="rtl" style={{ color: '#8ea0b6', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                {level.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            Why Families Choose ArabiKids
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ color: 'var(--color-blue)', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ color: '#5a6a7a', margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '60px 0' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.num} className="card" style={{ textAlign: 'center' }}>
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
                {s.num}
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
            What Parents Say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card">
                <p style={{ color: '#4b5a6a', fontStyle: 'italic', marginTop: 0 }}>&ldquo;{t.quote}&rdquo;</p>
                <p style={{ color: 'var(--color-blue)', fontWeight: 800, margin: 0 }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-green)', color: '#fff', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
            Give your child the gift of understanding the Quran
          </h2>
          <p style={{ maxWidth: 600, margin: '0 auto 28px', opacity: 0.9 }}>
            Stage 1 is free for every child, no credit card needed.
          </p>
          <Link to="/signup" className="btn" style={{ background: 'var(--color-gold)', color: '#fff' }}>
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
