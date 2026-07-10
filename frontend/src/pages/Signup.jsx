import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    childName: '',
    ageGroup: 'junior',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/thank-you');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          Create Your Account
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Start with 5 free lessons in each age group.
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Parent Name</label>
            <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="childName">Child&apos;s Name</label>
            <input id="childName" required value={form.childName} onChange={(e) => update('childName', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="ageGroup">Age Group</label>
            <select id="ageGroup" value={form.ageGroup} onChange={(e) => update('ageGroup', e.target.value)}>
              <option value="junior">Junior (ages 3-7)</option>
              <option value="explorer">Explorer (ages 8-17)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
