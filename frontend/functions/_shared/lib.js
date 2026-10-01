// Shared helpers for Cloudflare Pages Functions (ported from
// netlify/functions/_lib.js). These are the ONLY places in the app that
// touch STRIPE_SECRET_KEY / SUPABASE_SERVICE_KEY — everything else talks to
// Supabase directly from the browser under RLS.
//
// Unlike Netlify Functions (which read secrets off `process.env` at any
// time), Cloudflare Pages Functions only expose env vars/secrets through the
// per-request `env` object passed into each handler — there's no
// process.env global here — so every helper below takes `env` as a
// parameter instead of reading a module-level const.
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export function getServiceClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Stripe's default HTTP client is built on node:https, which doesn't exist
// in the Cloudflare Workers/Pages runtime - createFetchHttpClient() swaps
// in a Fetch-API-based client instead (Cloudflare's own documented pattern
// for using the Stripe SDK at the edge). Needed for every real API call
// (stripe.subscriptions.retrieve/update in stripe-webhook.js); signature
// verification itself uses the separate constructEventAsync() (Web Crypto
// based, see stripe-webhook.js) rather than the sync constructEvent(),
// which relies on Node's crypto module.
export function getStripe(env) {
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
}

// Verifies the caller's Supabase access token (sent as `Authorization: Bearer <token>`
// from the frontend, using the session it already has) and returns that auth user.
export async function getAuthedUser(request, env) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = getServiceClient(env);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
