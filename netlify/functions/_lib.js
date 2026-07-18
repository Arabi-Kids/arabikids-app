// Shared helpers for Netlify Functions. These are the ONLY places in the app
// that touch STRIPE_SECRET_KEY / SUPABASE_SERVICE_KEY / ENGINEMAILER_API_KEY —
// everything else talks to Supabase directly from the browser under RLS.
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
}

const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID,
};

// Verifies the caller's Supabase access token (sent as `Authorization: Bearer <token>`
// from the frontend, using the session it already has) and returns that auth user.
async function getAuthedUser(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

module.exports = { getServiceClient, getStripe, PRICE_IDS, getAuthedUser, json };
