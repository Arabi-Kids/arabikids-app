import { useEffect } from 'react';

// No react-helmet dependency - this app has no SSR, so a per-route <title>/
// meta setup only ever needs to patch document.head client-side once React
// mounts. Google's crawler executes JS and picks these up; non-JS bots
// (social share previews, some SEO tools) still fall back to index.html's
// static defaults, which is an accepted limitation of a client-rendered SPA
// without prerendering.
const SITE_URL = 'https://arabikids.online';
const DEFAULT_IMAGE = `${SITE_URL}/icons/og-image.png`;

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Renders nothing - just patches document.head for the current route.
 * `path` should be the route's path (e.g. '/pricing') for the canonical URL
 * and og:url. `noindex` marks pages like 404 that shouldn't be indexed. */
export default function Seo({ title, description, path = '/', noindex = false }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    if (title) document.title = title;
    if (description) upsertMeta('name', 'description', description);
    upsertLink('canonical', url);
    upsertMeta('property', 'og:title', title || document.title);
    if (description) upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', DEFAULT_IMAGE);
    upsertMeta('name', 'twitter:title', title || document.title);
    if (description) upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noindex]);

  return null;
}
