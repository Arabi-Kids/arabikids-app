import { Link } from 'react-router-dom';

const STEPS = [
  { num: 1, title: 'Sign Up', text: 'Create a free parent account, then add a profile for each child — every child gets their own starting stage.' },
  { num: 2, title: 'Start with Stage 1, Free', text: 'Try Stage 1 for free, no credit card required.' },
  { num: 3, title: 'Concept → Arabic Word → Quran', text: 'Every lesson introduces a concept, a real Arabic word, and shows exactly where it appears in the Quran.' },
  { num: 4, title: 'Checkpoints Along the Way', text: 'Every few lessons, a quick checkpoint reviews what\'s been learned; a final mastery checkpoint unlocks the next stage.' },
  { num: 5, title: 'Track Progress', text: 'Parents see completion charts, streaks, and scores for each child on the Progress page.' },
  { num: 6, title: 'Unlock the Full Curriculum', text: 'Subscribe monthly or annually to unlock all 16 stages, from first letters to fluent reading.' },
];

const LEVELS = [
  { name: 'Beginner', stages: 'Stages 1-4', focus: 'Letters, harakat, tanween & sukoon' },
  { name: 'Elementary', stages: 'Stages 5-8', focus: 'First words, Islamic vocabulary & phrases' },
  { name: 'Intermediate', stages: 'Stages 9-12', focus: 'Nouns, gender, prepositions, questions & Idafa' },
  { name: 'Advanced', stages: 'Stages 13-16', focus: 'Verbs, sentences & reading real Quranic verses' },
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
        Four Levels, Sixteen Stages
      </h2>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        One continuous curriculum, ages 3-17 — your child starts at the stage that fits them best.
      </p>
      <div style={{ maxWidth: 800, margin: '0 auto 60px', overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Stages</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((level) => (
              <tr key={level.name}>
                <td style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{level.name}</td>
                <td>{level.stages}</td>
                <td>{level.focus}</td>
              </tr>
            ))}
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
            <p style={{ margin: '8px 0 0', color: '#4b5a6a' }}>
              Mark the lesson complete and move on — every few lessons, a checkpoint reviews everything so far.
            </p>
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
