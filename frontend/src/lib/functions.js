import { supabase } from './supabase.js';

// Thin wrapper for the handful of Netlify Functions (netlify/functions/*) —
// the only server-side endpoints left in this app, used exclusively for
// things that need a secret key off the client (Stripe, Enginemailer).
// Everything else talks to Supabase directly (see lib/db.js).
async function callFunction(path, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export const functionsApi = {
  createCheckout: (plan) => callFunction('/create-checkout', { plan }),
  billingPortal: () => callFunction('/billing-portal'),
  cancelSubscription: () => callFunction('/cancel-subscription'),
  subscribeEnginemailer: (payload) => callFunction('/subscribe-enginemailer', payload),
  requestPasswordReset: (email) => callFunction('/request-password-reset', { email }),
};
