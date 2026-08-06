import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { captureAttribution } from './lib/attribution.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// The admin portal is a separate installable PWA from the public site: same
// service worker/bundle (there's only one build), but its own manifest
// (scope '/admin/', its own name/theme) so "Install app" on /admin/* offers
// an "ArabiKids Admin" shortcut instead of the parent-facing one.
const isAdminRoute = window.location.pathname.startsWith('/admin');
if (!isAdminRoute) captureAttribution();
if (isAdminRoute) {
  const manifestLink = document.querySelector('link[rel="manifest"]') || document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/admin-manifest.webmanifest';
  if (!manifestLink.isConnected) document.head.appendChild(manifestLink);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f1f33');
}

import('virtual:pwa-register').then(({ registerSW }) => {
  const updateSW = registerSW({
    immediate: true,
    // registerType: 'autoUpdate' only checks for a new service worker once,
    // at registration - fine for a normal browser tab (which re-checks on
    // every full navigation) but not for a kid who installs the PWA and
    // leaves it open for hours/days without ever closing it. Re-checking
    // periodically means that tab still picks up new deploys.
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => registration.update(), 30 * 60 * 1000);
    },
  });
  void updateSW;
});
