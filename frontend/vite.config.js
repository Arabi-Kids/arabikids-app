import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// DEV-ONLY (fixture mode, `vite serve` only - never part of a build): serves
// ../audio-library/*.mp3 at /dev-audio/ plus /dev-audio/index.json (the ids
// that exist) so locally generated voice clips can be heard inside the real
// screens before anything is uploaded or approved.
function devAudioLibrary() {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'audio-library');
  return {
    name: 'dev-audio-library',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/dev-audio', (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/+/, '');
        if (name === 'index.json') {
          const ids = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)) : [];
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ids));
          return;
        }
        const file = path.join(dir, name);
        if (!file.startsWith(dir) || !name.endsWith('.mp3') || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', 'audio/mpeg');
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'fixture' ? [devAudioLibrary()] : []),
    VitePWA({
      // We register the service worker ourselves from main.jsx, which also
      // swaps in a separate manifest (admin-manifest.webmanifest) on /admin/*
      // routes so the admin portal installs as its own PWA.
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
}));
