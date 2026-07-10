import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ThankYou() {
  const { user } = useAuth();
  const group = user?.ageGroup || 'junior';

  return (
    <div className="container" style={{ padding: '70px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
      <h1 className="page-title">Welcome to ArabiKids{user?.childName ? `, ${user.childName}` : ''}!</h1>
      <p className="page-subtitle">Your account is ready. Here's what happens next.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto 40px' }}>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>1️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Start your first lesson</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>5 lessons are free in your track, right now.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>2️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Track progress</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>Check the Progress page to see streaks and scores.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>3️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Unlock everything</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>Subscribe anytime to unlock all 90 lessons.</p>
        </div>
      </div>

      <Link to={`/lessons/${group}`} className="btn btn-primary">
        Go to Lesson Hub
      </Link>
    </div>
  );
}
