import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import HudMascot from '../components/HudMascot.jsx';

const STEPS = [
  { num: 1, title: 'Add your child', text: 'Each child gets their own stage, streak, and progress.' },
  { num: 2, title: 'Start Stage 1, free', text: 'No credit card needed to try the first stage.' },
  { num: 3, title: 'Unlock everything', text: 'Subscribe anytime to unlock the full 16-stage curriculum.' },
];

export default function ThankYou() {
  const { user } = useAuth();
  const { childProfiles, loading } = useActiveChild();
  const hasChild = childProfiles.length > 0;

  return (
    <div className="container" style={{ padding: '70px 0', textAlign: 'center' }}>
      <HudMascot pose="celebrate" size={100} style={{ margin: '0 auto 12px' }} />
      <h1 className="page-title">Welcome to ArabiKids{user?.name ? `, ${user.name}` : ''}!</h1>
      <p className="page-subtitle">Your account is ready. Here's what happens next.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto 40px' }}>
        {STEPS.map((step) => (
          <div key={step.num} className="card">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                margin: '0 auto 12px',
              }}
            >
              {step.num}
            </div>
            <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>{step.title}</p>
            <p style={{ color: '#5a6a7a', margin: 0 }}>{step.text}</p>
          </div>
        ))}
      </div>

      {!loading && (
        <Link to={hasChild ? '/lessons' : '/add-child'} className="btn btn-primary">
          {hasChild ? 'Go to Lesson Hub' : 'Add Your First Child'}
        </Link>
      )}
    </div>
  );
}
