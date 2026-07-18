const { getServiceClient, getStripe, getAuthedUser, json } = require('./_lib');

// POST /api/billing-portal
// Requires Authorization: Bearer <supabase access token>.
// New endpoint — the old MySQL/Express backend never had this, so Account.jsx
// only offered a self-implemented "Cancel Subscription" button with no way to
// see invoices or update a payment method.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  const authUser = await getAuthedUser(event);
  if (!authUser) return json(401, { message: 'Not authenticated.' });

  const supabase = getServiceClient();
  const { data: user, error } = await supabase.from('users').select('stripe_customer_id').eq('id', authUser.id).single();
  if (error || !user?.stripe_customer_id) {
    return json(400, { message: 'No billing account found yet — subscribe first.' });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });
    return json(200, { url: session.url });
  } catch (err) {
    console.error('billing-portal error:', err);
    return json(500, { message: 'Failed to open billing portal.' });
  }
};
