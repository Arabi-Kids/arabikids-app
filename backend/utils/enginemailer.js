// Thin wrapper around the Enginemailer REST API.
// Docs: https://www.enginemailer.com (REST API v3.5)
const fetch = require('node-fetch');

const API_URL = process.env.ENGINEMAILER_API_URL;
const API_KEY = process.env.ENGINEMAILER_API_KEY;
const LIST_ID = process.env.ENGINEMAILER_LIST_ID;
const WELCOME_TEMPLATE_ID = process.env.ENGINEMAILER_WELCOME_TEMPLATE_ID;

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ApiKey: API_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Enginemailer error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// Adds a new user to the ArabiKids subscriber list.
async function addSubscriber({ email, name }) {
  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping addSubscriber');
    return null;
  }
  return post('/Subscriber/Add', {
    ListId: LIST_ID,
    Email: email,
    Fields: { Name: name },
  });
}

// Sends the welcome email via a pre-built Enginemailer template.
async function sendWelcomeEmail({ email, name }) {
  if (!API_KEY) {
    console.warn('Enginemailer API key not configured, skipping sendWelcomeEmail');
    return null;
  }
  return post('/Email/SendTemplate', {
    TemplateId: WELCOME_TEMPLATE_ID,
    To: email,
    MergeFields: { Name: name },
  });
}

module.exports = { addSubscriber, sendWelcomeEmail };
