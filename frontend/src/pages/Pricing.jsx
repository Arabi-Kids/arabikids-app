import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import HudMascot from '../components/HudMascot.jsx';
import Seo from '../components/Seo.jsx';

const TIER_PRICING = {
  standard: { monthly: '$9.99', annual: '$89.99' },
  family: { monthly: '$14.99', annual: '$134.99' },
};

// Stripe Payment Links (created directly in the Stripe Dashboard, one per
// package) instead of a dynamically-created Checkout Session - no server
// call needed to start checkout. Each link must have its own `tier`/`plan`
// metadata set in the Dashboard (Payment Link -> Advanced options ->
// Metadata) so stripe-webhook.js can tell which package was purchased; the
// buying user's id is appended below as `client_reference_id` so the
// webhook can link the resulting subscription back to their account.
const PAYMENT_LINKS = {
  standard: {
    monthly: import.meta.env.VITE_STRIPE_LINK_STANDARD_MONTHLY,
    annual: import.meta.env.VITE_STRIPE_LINK_STANDARD_ANNUAL,
  },
  family: {
    monthly: import.meta.env.VITE_STRIPE_LINK_FAMILY_MONTHLY,
    annual: import.meta.env.VITE_STRIPE_LINK_FAMILY_ANNUAL,
  },
};

export default function Pricing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tier, setTier] = useState('standard');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  const copy = t('pricing');
  const pricing = TIER_PRICING[tier];
  const childLine = copy.childLine[tier];
  const plans = [
    {
      id: 'free',
      name: copy.planNames.free,
      price: '$0',
      period: '',
      perks: copy.freePerks,
    },
    {
      id: 'monthly',
      name: copy.planNames.monthly,
      price: pricing.monthly,
      period: `/ ${copy.planNames.monthly.toLowerCase()}`,
      perks: [copy.monthlyPerks[0], childLine, ...copy.monthlyPerks.slice(1)],
    },
    {
      id: 'annual',
      name: copy.planNames.annual,
      price: pricing.annual,
      period: `/ ${copy.planNames.annual.toLowerCase()}`,
      highlight: true,
      perks: copy.annualPerks,
    },
  ];

  const comparisonRows = [
    [copy.comparisonRows[0], '✓', '✓', '✓'],
    [copy.comparisonRows[1], '—', '✓', '✓'],
    [copy.comparisonRows[2], '1', tier === 'family' ? '2+' : '1', tier === 'family' ? '2+' : '1'],
    [copy.comparisonRows[3], '✓', '✓', '✓'],
    [copy.comparisonRows[4], '✓', '✓', '✓'],
    [copy.comparisonRows[5], '$0', `${pricing.monthly}/mo`, `${pricing.annual}/yr`],
  ];

  function handleChoose(planId) {
    if (planId === 'free') {
      navigate(user ? '/lessons' : '/signup');
      return;
    }
    if (!user) {
      navigate('/signup');
      return;
    }
    setError('');
    const link = PAYMENT_LINKS[tier]?.[planId];
    if (!link) {
      setError('This plan is not available for checkout yet — please try again shortly.');
      return;
    }
    setLoadingPlan(planId);
    const url = new URL(link);
    url.searchParams.set('client_reference_id', user.id);
    if (user.email) url.searchParams.set('prefilled_email', user.email);
    window.location.href = url.toString();
  }

  return (
    <div>
    <Seo
      title="Pricing | ArabiKids"
      description="Simple, family-friendly pricing for ArabiKids. Start free with Stage 1, no credit card required, then upgrade to unlock all 16 stages."
      path="/pricing"
    />
    <div className="container" style={{ padding: '60px 0 24px', textAlign: 'center' }}>
      <HudMascot pose="mark" size={64} style={{ marginBottom: 12 }} />
      <h1 className="page-title">{copy.title}</h1>
      <p className="page-subtitle">{copy.subtitle}</p>
      {error && <p className="error-text">{error}</p>}

      <div
        role="group"
        aria-label="Choose how many children"
        style={{ display: 'inline-flex', background: 'var(--color-sky)', borderRadius: 999, padding: 4, gap: 4, marginBottom: 8 }}
      >
        {[
          { id: 'standard', label: copy.childToggle.one },
          { id: 'family', label: copy.childToggle.family },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTier(option.id)}
            className={tier === option.id ? 'btn btn-primary' : 'btn'}
            style={{ padding: '8px 18px', fontSize: '0.9rem', background: tier === option.id ? undefined : 'transparent', color: tier === option.id ? undefined : 'var(--color-blue)' }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 940, margin: '0 auto' }}>
        {plans.map((plan) => (
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
              <span className="badge badge-locked" style={{ position: 'absolute', top: -14, insetInlineStart: '50%', transform: 'translateX(-50%)' }}>
                {copy.bestValue}
              </span>
            )}
            <h2 style={{ color: 'var(--color-blue)', margin: '8px 0' }}>{plan.name}</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-gold)' }}>
              {plan.price}
              <span style={{ fontSize: '1rem', color: '#6b7a8a', fontWeight: 700 }}> {plan.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', textAlign: 'start' }}>
              {plan.perks.map((perk) => (
                <li key={perk} style={{ padding: '6px 0', color: '#4b5a6a' }}>
                  ✓ {perk}
                </li>
              ))}
            </ul>
            <button
              className={plan.id === 'free' ? 'btn btn-outline btn-chunky' : 'btn btn-primary btn-chunky'}
              style={{ width: '100%' }}
              onClick={() => handleChoose(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id ? copy.redirecting : plan.id === 'free' ? copy.startFree : copy.choosePlan.replace('{name}', plan.name)}
            </button>
          </div>
        ))}
      </div>
    </div>

    <section className="section-sky" style={{ padding: '56px 0' }}>
      <div className="container">
        <h2 className="page-title" style={{ textAlign: 'center' }}>{copy.comparisonTitle}</h2>
        <div style={{ maxWidth: 720, margin: '0 auto', overflowX: 'auto' }}>
          <table className="table" style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
            <thead>
              <tr><th></th><th>{copy.planNames.free}</th><th>{copy.planNames.monthly}</th><th>{copy.planNames.annual}</th></tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => <td key={i}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ textAlign: 'center', color: '#8ea0b6', marginTop: 16 }}>
          {copy.priceNote.replace('{tier}', tier === 'family' ? copy.tierNames.family : copy.tierNames.standard)}
        </p>
      </div>
    </section>

    <div className="container" style={{ padding: '56px 0' }}>
      <h2 className="page-title" style={{ textAlign: 'center' }}>{copy.faqTitle}</h2>
      <div style={{ maxWidth: 640, margin: '0 auto 40px' }}>
        {copy.faqs.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary btn-chunky" onClick={() => navigate('/signup')}>
          {copy.getStartedFree}
        </button>
      </div>
    </div>
    </div>
  );
}
