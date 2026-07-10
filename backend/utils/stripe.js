const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID,
};

module.exports = { stripe, PRICE_IDS };
