// Sends ONE copy of the announcement email to a single address (for example the
// owner's own inbox), using the same layout and text as the broadcast.
//
//   node scripts/send-announcement-copy.mjs --to hello@arabikids.online [--prefix "[Preview] "]
//
// Reads ENGINEMAILER_* from .env. Sends exactly one email; never to the parent list.
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { sendTransactionalEmail, emailLayout } from '../frontend/functions/_shared/enginemailer.js';

const args = process.argv.slice(2);
const val = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const to = val('--to');
if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
  console.error('Usage: node scripts/send-announcement-copy.mjs --to someone@example.com [--prefix "[Preview] "]');
  process.exit(1);
}
const mail = JSON.parse(readFileSync(new URL('./announcement-email.json', import.meta.url), 'utf8'));
const html = emailLayout({
  title: mail.subject,
  bodyHtml: `<p>${mail.body.replace(/\n/g, '<br>')}</p>`,
  ctaText: 'Learn More',
  ctaUrl: mail.link,
});
const result = await sendTransactionalEmail({
  env: process.env,
  toEmail: to,
  subject: `${val('--prefix') ?? ''}${mail.subject}`,
  html,
  campaignName: 'ArabiKids Announcement (copy)',
});
console.log(result.sent ? `sent one copy to ${to}` : `NOT sent: ${result.reason}`);
process.exit(result.sent ? 0 : 1);
