const { getServiceClient, getStripe, PRICE_IDS, getAuthedUser, json } = require('./_lib');

// POST /api/create-checkout  { plan: 'monthly' | 'annual', tier?: 'standard' | 'family' }
// Requires Authorization: Bearer <supabase access token>.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  const authUser = await getAuthedUser(event);
  if (!authUser) return json(401, { message: 'Not authenticated.' });

  let plan;
  let tier;
  try {
    ({ plan, tier = 'standard' } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { message: 'Invalid request body.' });
  }
  if (!['monthly', 'annual'].includes(plan)) {
    return json(400, { message: 'Plan must be "monthly" or "annual".' });
  }
  if (!['standard', 'family'].includes(tier)) {
    return json(400, { message: 'Tier must be "standard" or "family".' });
  }
  const priceId = PRICE_IDS[tier][plan];
  if (!priceId) {
    return json(500, { message: `No Stripe price configured for ${tier}/${plan}.` });
  }

  const supabase = getServiceClient();
  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (userError || !user) return json(404, { message: 'User not found.' });

  const stripe = getStripe();

  try {
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/account?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?checkout=cancelled`,
      metadata: { userId: user.id, plan, tier },
      subscription_data: { metadata: { userId: user.id, plan, tier } },
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error('create-checkout error:', err);
    return json(500, { message: 'Failed to start checkout.' });
  }
};
