import { Link } from 'react-router-dom';

const STEPS = [
  { num: 1, title: 'Sign Up', text: 'Create a free parent account and choose your child\'s age group: Junior or Explorer.' },
  { num: 2, title: 'Start with 5 Free Lessons', text: 'Try 5 lessons in your track for free, no credit card required.' },
  { num: 3, title: 'Concept → Arabic Word → Quran', text: 'Every lesson introduces a concept, a real Arabic word, and shows exactly where it appears in the Quran.' },
  { num: 4, title: 'Practice with 3 Exercises', text: 'Each lesson ends with three interactive checks to make sure the concept really landed.' },
  { num: 5, title: 'Track Progress', text: 'Parents see completion charts, streaks, and scores on the Progress page.' },
  { num: 6, title: 'Unlock All 90 Lessons', text: 'Subscribe monthly or annually to unlock the remaining 40 lessons in each track.' },
];

export default function HowItWorks() {
  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>
        How ArabiKids Works
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        Arabic and Quran, taught together, every step of the way.
      </p>

      <div style={{ maxWidth: 720, margin: '0 auto 60px' }}>
        {STEPS.map((step) => (
          <div key={step.num} className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
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
              {step.num}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', color: 'var(--color-blue)' }}>{step.title}</h3>
              <p style={{ margin: 0, color: '#5a6a7a' }}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>
        Junior vs Explorer
      </h2>
      <div style={{ maxWidth: 800, margin: '0 auto 60px', overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Junior</th>
              <th>Explorer</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Ages</td><td>3-7</td><td>8-17</td></tr>
            <tr><td>Curriculum</td><td>Noorania Qaida-style phonics</td><td>Madinah Arabic Book 1</td></tr>
            <tr><td>Focus</td><td>Letters, basic words, colours, numbers, family</td><td>Grammar, sentence structure, verb conjugation</td></tr>
            <tr><td>Reading</td><td>Simple Quranic words</td><td>Full Quranic verses, word by word</td></tr>
            <tr><td>Style</td><td>Visual, playful</td><td>Structured, in-depth</td></tr>
            <tr><td>Lessons</td><td>45 (5 free + 40 paid)</td><td>45 (5 free + 40 paid)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>
        Sample Lesson Walkthrough
      </h2>
      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <span className="badge badge-free">Step 1</span>
            <p style={{ margin: '8px 0 0', fontWeight: 700 }}>Concept: Learn the letter ب (baa)</p>
          </div>
          <div>
            <span className="badge badge-free">Step 2</span>
            <p className="arabic-text" dir="rtl" style={{ margin: '8px 0 0', fontSize: '1.8rem' }}>بِسْمِ</p>
            <p style={{ margin: 0, color: '#6b7a8a' }}>"in the name of"</p>
          </div>
          <div>
            <span className="badge badge-locked">Step 3</span>
            <p style={{ margin: '8px 0 0', color: '#4b5a6a' }}>
              Quranic Connection: this is the opening word of Surah Al-Fatihah, 1:1.
            </p>
          </div>
          <div>
            <span className="badge badge-free">Step 4</span>
            <p style={{ margin: '8px 0 0', color: '#4b5a6a' }}>3 quick exercises to check understanding, then on to the next lesson.</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link to="/signup" className="btn btn-primary">
          Start Free Trial
        </Link>
      </div>
    </div>
  );
}
