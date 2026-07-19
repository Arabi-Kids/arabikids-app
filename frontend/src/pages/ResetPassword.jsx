import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Clicking the emailed link lands here with a recovery token in the URL —
    // supabase-js parses it automatically and fires PASSWORD_RECOVERY once
    // the temporary recovery session is established.
    let becameReady = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        becameReady = true;
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        becameReady = true;
        setReady(true);
      }
    });

    const timeout = setTimeout(() => {
      if (!becameReady) setInvalid(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Password Updated</h1>
          <p className="page-subtitle" style={{ marginBottom: 20 }}>Your password has been changed successfully.</p>
          <button className="btn btn-primary" onClick={() => navigate('/lessons/junior')}>
            Continue to ArabiKids
          </button>
        </div>
      </div>
    );
  }

  if (invalid && !ready) {
    return (
      <div className="container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Link Expired</h1>
          <p className="page-subtitle" style={{ marginBottom: 20 }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/forgot-password')}>
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="container" style={{ padding: 60, textAlign: 'center' }}>Verifying your link...</div>;
  }

  return (
    <div className="container">
      <div className="card auth-card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          Set a New Password
        </h1>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
