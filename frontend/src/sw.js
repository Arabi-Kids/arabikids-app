import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Custom service worker (vite-plugin-pwa `injectManifest` strategy) instead
// of the plugin's auto-generated one, specifically so we can add real `push`
// / `notificationclick` handlers below - `generateSW` mode has no hook for
// custom event listeners. Precaching + runtime caching are recreated here to
// match what the previous generateSW config did.

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Lesson listing/detail reads only (Supabase PostgREST GET calls) - lets the
// Lesson Hub and already-visited lessons work offline. Never matches auth
// (/auth/v1/*) or writes (POST/PATCH), so login and progress submission
// always require a live network round trip.
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'arabikids-lessons-api',
    networkTimeoutSeconds: 4,
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// The admin portal never gets an app-shell offline fallback - if its
// SW-controlled tab ever goes offline mid-navigation, let it fail normally
// rather than silently serving cached public-site HTML.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/admin/] }));

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// --- Web Push: daily streak reminders (see netlify/functions/send-streak-reminders.js) ---

self.addEventListener('push', (event) => {
  let payload = { title: 'ArabiKids', body: "Come back and keep your streak going!" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON push payload - fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url || '/lessons' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/lessons';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
