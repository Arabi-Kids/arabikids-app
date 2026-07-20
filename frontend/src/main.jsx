import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// The admin portal must stay a plain, non-installable, non-offline app —
// only register the PWA service worker for the public site.
if (!window.location.pathname.startsWith('/admin')) {
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
}
