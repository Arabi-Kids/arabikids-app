import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HudMascot from '../components/HudMascot.jsx';
import Seo from '../components/Seo.jsx';
import { fireConversion } from '../lib/ads.js';

// Stripe Payment Links only support a redirect on the *success* path
// (after_completion) - there's no equivalent "cancel_url" for a declined or
// abandoned payment the way a Checkout Session has, since a card decline is
// handled inline on Stripe's own hosted page (the customer never leaves it
// to get here). So 'success' is the only state Stripe can actually land
// someone on automatically; 'failed' is linked from Account.jsx's past_due
// banner (a real signal from stripe-webhook.js), and 'canceled' is a general
// fallback for anyone who navigates here without completing checkout.
const STATUS_CONTENT = {
  success: {
    pose: 'celebrate',
    title: "You're All Set!",
    subtitle: 'Your subscription is active - the full 16-stage curriculum is unlocked.',
    ctaTo: '/lessons',
    ctaLabel: 'Go to Lesson Hub',
  },
  failed: {
    pose: 'lost',
    title: "Payment Didn't Go Through",
    subtitle: "We couldn't process your payment. Your card may have been declined, or the payment method needs updating.",
    ctaTo: '/account',
    ctaLabel: 'Update Payment Method',
  },
  canceled: {
    pose: 'lost',
    title: 'Checkout Canceled',
    subtitle: "No worries - you can pick up right where you left off whenever you're ready.",
    ctaTo: '/pricing',
    ctaLabel: 'Back to Pricing',
  },
};

export default function CheckoutStatus() {
  const [params] = useSearchParams();
  const requested = params.get('status');
  const status = STATUS_CONTENT[requested] ? requested : 'canceled';
  const content = STATUS_CONTENT[status];

  useEffect(() => {
    if (status === 'success') fireConversion('purchase');
  }, [status]);

  return (
    <div className="container" style={{ padding: '70px 0', textAlign: 'center' }}>
      <Seo title={`${content.title} | ArabiKids`} path="/checkout" noindex />
      <HudMascot pose={content.pose} size={100} style={{ margin: '0 auto 12px' }} />
      <h1 className="page-title">{content.title}</h1>
      <p className="page-subtitle" style={{ maxWidth: 480, margin: '0 auto 24px' }}>{content.subtitle}</p>
      <Link to={content.ctaTo} className="btn btn-primary">
        {content.ctaLabel}
      </Link>
      {status !== 'success' && (
        <p style={{ marginTop: 24 }}>
          <a href="mailto:hello@arabikids.online" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
            Need help? Contact us
          </a>
        </p>
      )}
    </div>
  );
}
