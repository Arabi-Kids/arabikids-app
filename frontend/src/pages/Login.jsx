import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import HudMascot from '../components/HudMascot.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/lessons');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          Welcome Back
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Log in to continue your Arabic journey.
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>Forgot password?</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8 }}>
          Don&apos;t have an account? <Link to="/signup" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
