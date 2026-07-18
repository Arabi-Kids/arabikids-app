import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We register the service worker ourselves from main.jsx (and skip it
      // entirely on /admin/* routes) instead of letting the plugin auto-inject
      // registration — the admin portal must stay a plain, non-installable app.
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'ArabiKids',
        short_name: 'ArabiKids',
        description: 'Teaching the Language of the Quran — One Kid at a Time.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#fbf9f3',
        theme_color: '#1b4f8a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The admin portal never gets an app-shell offline fallback — if its
        // SW-controlled tab ever goes offline mid-navigation, let it fail
        // normally rather than silently serving cached public-site HTML.
        navigateFallbackDenylist: [/^\/admin/],
        runtimeCaching: [
          {
            // Lesson listing/detail reads only (Supabase PostgREST GET calls) —
            // lets the Lesson Hub and already-visited lessons work offline.
            // Never matches auth (/auth/v1/*) or writes (POST/PATCH), so login
            // and progress submission always require a live network round trip.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'arabikids-lessons-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
