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
      // injectManifest (a custom src/sw.js) instead of generateSW - needed so
      // the service worker can have real `push`/`notificationclick` handlers
      // for streak-reminder notifications, which generateSW's auto-generated
      // worker has no hook for. Precaching + the Supabase runtime-caching
      // rule below are recreated by hand inside src/sw.js.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
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
    }),
  ],
  server: {
    port: 5173,
  },
});
