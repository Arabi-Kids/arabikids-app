import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { functionsApi } from '../lib/functions.js';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    perks: ['Stage 1 free to try', 'No credit card required', 'Full access to intro content'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/ month',
    perks: ['All 16 stages unlocked (~150 lessons)', 'One child profile', 'Progress tracking', 'Cancel anytime'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$89.99',
    period: '/ year',
    highlight: true,
    perks: ['Everything in Monthly', 'Save over 25% vs monthly', 'Priority support', 'Best for full-year learning'],
  },
];

const COMPARISON_ROWS = [
  ['Free stage to try', '✓', '✓', '✓'],
  ['Full 16-stage curriculum', '—', '✓', '✓'],
  ['Progress tracking', '✓', '✓', '✓'],
  ['Quranic connection on every lesson', '✓', '✓', '✓'],
  ['Price', '$0', '$9.99/mo', '$89.99/yr'],
];

const FAQS = [
  { q: 'Do I need a credit card to start?', a: 'No. The free plan gives you Stage 1 to try with no credit card required.' },
  { q: 'Can I add more than one child?', a: 'Each Standard plan covers one child profile. A Family plan for multiple children is coming soon — contact us if you need it sooner.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Monthly and annual plans can be cancelled anytime from your Account page, effective at the end of the current billing period.' },
  { q: 'Is the content only for Arabic speakers?', a: 'No, ArabiKids is built specifically for Muslim children growing up outside the Arab world, with transliteration and translation throughout.' },
  { q: 'What ages is this for?', a: 'ArabiKids covers ages 3-17 in one continuous curriculum — your child starts at whichever of the 16 stages fits them best.' },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  async function handleChoose(planId) {
    if (planId === 'free') {
      navigate(user ? '/lessons' : '/signup');
      return;
    }
    if (!user) {
      navigate('/signup');
      return;
    }
    setError('');
    setLoadingPlan(planId);
    try {
      const { url } = await functionsApi.createCheckout(planId);
      if (!url) throw new Error('Could not start checkout — please try again.');
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>
        Simple, Family-Friendly Pricing
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        Start free. Upgrade only when you're ready to unlock the full 16-stage curriculum.
      </p>
      {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 940, margin: '0 auto 24px' }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="card"
            style={{
              textAlign: 'center',
              border: plan.highlight ? '3px solid var(--color-gold)' : 'none',
              position: 'relative',
            }}
          >
            {plan.highlight && (
              <span className="badge badge-locked" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                Best Value
              </span>
            )}
            <h2 style={{ color: 'var(--color-blue)', margin: '8px 0' }}>{plan.name}</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-gold)' }}>
              {plan.price}
              <span style={{ fontSize: '1rem', color: '#6b7a8a', fontWeight: 700 }}> {plan.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', textAlign: 'left' }}>
              {plan.perks.map((perk) => (
                <li key={perk} style={{ padding: '6px 0', color: '#4b5a6a' }}>
                  ✓ {perk}
                </li>
              ))}
            </ul>
            <button
              className={plan.id === 'free' ? 'btn btn-outline' : 'btn btn-primary'}
              style={{ width: '100%' }}
              onClick={() => handleChoose(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : plan.id === 'free' ? 'Start Free' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: '#8ea0b6', maxWidth: 640, margin: '0 auto 60px' }}>
        Have more than one child? A Family plan is coming soon.{' '}
        <a href="mailto:ArabiKidsApp@gmail.com" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
          Email us
        </a>{' '}
        if you'd like it sooner.
      </p>

      <h2 className="page-title" style={{ textAlign: 'center' }}>Compare Plans</h2>
      <div style={{ maxWidth: 720, margin: '0 auto 60px', overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr><th></th><th>Free</th><th>Monthly</th><th>Annual</th></tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
      <div style={{ maxWidth: 640, margin: '0 auto 40px' }}>
        {FAQS.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/signup')}>
          Get Started Free
        </button>
      </div>
    </div>
  );
}
