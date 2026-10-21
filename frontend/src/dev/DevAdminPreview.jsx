import { useParams } from 'react-router-dom';
import AdminContentReview from '../admin/AdminContentReview.jsx';
import AdminAudioReview from '../admin/AdminAudioReview.jsx';

// DEV ONLY - mimics the admin shell so the two new review pages can be
// previewed without an admin login (see lib/content.js isFixtureMode).
export default function DevAdminPreview() {
  const { page } = useParams();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            Arabi<span style={{ color: 'var(--admin-accent)' }}>Kids</span> Admin
          </div>
        </div>
        <nav className="admin-nav-links">
          <a className={page === 'content' ? 'active' : ''} href="/dev-admin/content">Content Review</a>
          <a className={page === 'audio' ? 'active' : ''} href="/dev-admin/audio">Audio Review</a>
        </nav>
      </aside>
      <main className="admin-main">{page === 'audio' ? <AdminAudioReview /> : <AdminContentReview />}</main>
    </div>
  );
}
