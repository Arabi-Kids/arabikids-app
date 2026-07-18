const { getServiceClient, getStripe, getAuthedUser, json } = require('./_lib');

// POST /api/cancel-subscription — cancels at the end of the current billing period.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });

  const authUser = await getAuthedUser(event);
  if (!authUser) return json(401, { message: 'Not authenticated.' });

  const supabase = getServiceClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('stripe_subscription_id')
    .eq('id', authUser.id)
    .single();
  if (error || !user?.stripe_subscription_id) {
    return json(400, { message: 'No active subscription found.' });
  }

  try {
    const stripe = getStripe();
    await stripe.subscriptions.update(user.stripe_subscription_id, { cancel_at_period_end: true });
    return json(200, { message: 'Your subscription will be canceled at the end of the current billing period.' });
  } catch (err) {
    console.error('cancel-subscription error:', err);
    return json(500, { message: 'Failed to cancel subscription.' });
  }
};
