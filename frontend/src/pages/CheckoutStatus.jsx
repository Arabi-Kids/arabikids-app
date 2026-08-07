import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
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
const STATUS_META = {
  success: { pose: 'celebrate', ctaTo: '/lessons' },
  failed: { pose: 'lost', ctaTo: '/account' },
  canceled: { pose: 'lost', ctaTo: '/pricing' },
};

export default function CheckoutStatus() {
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const requested = params.get('status');
  const status = STATUS_META[requested] ? requested : 'canceled';
  const meta = STATUS_META[status];
  const content = { ...meta, ...t(`checkoutStatus.${status}`) };

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
            {t('checkoutStatus.needHelp')}
          </a>
        </p>
      )}
    </div>
  );
}
