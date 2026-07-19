import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';

export default function ThankYou() {
  const { user } = useAuth();
  const { childProfiles, loading } = useActiveChild();
  const hasChild = childProfiles.length > 0;

  return (
    <div className="container" style={{ padding: '70px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
      <h1 className="page-title">Welcome to ArabiKids{user?.name ? `, ${user.name}` : ''}!</h1>
      <p className="page-subtitle">Your account is ready. Here's what happens next.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto 40px' }}>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>1️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Add your child</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>Each child gets their own stage, streak, and progress.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>2️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Start Stage 1, free</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>No credit card needed to try the first stage.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '1.8rem' }}>3️⃣</div>
          <p style={{ fontWeight: 800, color: 'var(--color-blue)' }}>Unlock everything</p>
          <p style={{ color: '#5a6a7a', margin: 0 }}>Subscribe anytime to unlock the full 16-stage curriculum.</p>
        </div>
      </div>

      {!loading && (
        <Link to={hasChild ? '/lessons' : '/add-child'} className="btn btn-primary">
          {hasChild ? 'Go to Lesson Hub' : 'Add Your First Child'}
        </Link>
      )}
    </div>
  );
}
