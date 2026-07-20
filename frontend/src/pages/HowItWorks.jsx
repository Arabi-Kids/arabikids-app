import { Link } from 'react-router-dom';
import HudMascot from '../components/HudMascot.jsx';
import LessonWalkthroughAnimation from '../components/LessonWalkthroughAnimation.jsx';

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
    <div>
      <div className="container" style={{ padding: '60px 0 40px', textAlign: 'center' }}>
        <HudMascot pose="mark" size={64} style={{ marginBottom: 12 }} />
        <h1 className="page-title">How ArabiKids Works</h1>
        <p className="page-subtitle">Arabic and Quran, taught together, every step of the way.</p>
      </div>

      <section style={{ background: '#fff', padding: '20px 0 60px' }}>
        <div className="container" style={{ maxWidth: 720 }}>
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
      </section>

      <section className="section-sky" style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            Four Levels, Sixteen Stages
          </h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            One continuous curriculum, ages 3-17 — your child starts at the stage that fits them best.
          </p>
          <div style={{ maxWidth: 800, margin: '0 auto', overflowX: 'auto' }}>
            <table className="table" style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
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
        </div>
      </section>

      <section style={{ background: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center' }}>
            Sample Lesson Walkthrough
          </h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            Watch how a single lesson goes from letter to word to real practice.
          </p>
          <LessonWalkthroughAnimation />
        </div>
      </section>

      <section style={{ background: 'var(--color-green)', color: '#fff', padding: '56px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <HudMascot pose="celebrate" size={80} style={{ marginBottom: 12 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 20 }}>
            Ready to start the journey?
          </h2>
          <Link to="/signup" className="btn" style={{ background: 'var(--color-gold)', color: '#fff' }}>
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
