import { useState } from 'react';
import { submitContactMessage } from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <HudMascot pose="mark" size={64} style={{ display: 'block', margin: '0 auto 12px' }} />
      <h1 className="page-title" style={{ textAlign: 'center' }}>Contact Us</h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        Questions, feedback, or partnership ideas? We'd love to hear from you.
      </p>

      <div className="card auth-card" style={{ margin: '0 auto' }}>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--color-green)' }}>Message sent!</h3>
            <p style={{ color: '#4b5a6a' }}>Thanks for reaching out — we'll reply as soon as we can.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
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
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '2px solid #e0dccd', fontFamily: 'inherit', fontSize: '1rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 32, color: '#6b7a8a' }}>
        Or email us directly at{' '}
        <a href="mailto:hello@arabikids.online" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
          hello@arabikids.online
        </a>
      </p>
    </div>
  );
}
