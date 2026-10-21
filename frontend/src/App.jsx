import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite.jsx';
import AdminApp from './AdminApp.jsx';
import AffiliateApp from './AffiliateApp.jsx';

// Dev-only (eliminated from production builds): admin screens fed by the
// local content fixture, no login, for previewing before the migration runs.
const DevAdminPreview = import.meta.env.DEV ? lazy(() => import('./dev/DevAdminPreview.jsx')) : null;
const DevIndex = import.meta.env.DEV ? lazy(() => import('./dev/DevIndex.jsx')) : null;
const DevAnimals = import.meta.env.DEV ? lazy(() => import('./dev/AnimalGallery.jsx')) : null;
const DevSoundCheck = import.meta.env.DEV ? lazy(() => import('./dev/SoundCheck.jsx')) : null;

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/affiliate/*" element={<AffiliateApp />} />
      {DevIndex && <Route path="/dev" element={<Suspense fallback={null}><DevIndex /></Suspense>} />}
      {DevAnimals && <Route path="/dev/animals" element={<Suspense fallback={null}><DevAnimals /></Suspense>} />}
      {DevSoundCheck && <Route path="/dev/soundcheck" element={<Suspense fallback={null}><DevSoundCheck /></Suspense>} />}
      {DevAdminPreview && (
        <Route path="/dev-admin/:page" element={<Suspense fallback={null}><DevAdminPreview /></Suspense>} />
      )}
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
