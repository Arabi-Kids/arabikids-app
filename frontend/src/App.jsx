import { Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite.jsx';
import AdminApp from './AdminApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
