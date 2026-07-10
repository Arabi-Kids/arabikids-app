import { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { api } from '../api/client';

export default function AdminLessonsManager() {
  const { token } = useAdminAuth();
  const [ageGroup, setAgeGroup] = useState('junior');
  const [lessons, setLessons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  function loadLessons() {
    api.get('/admin/lessons', token).then((data) => setLessons(data.lessons)).catch((err) => setError(err.message));
  }

  useEffect(loadLessons, [token]);

  async function toggleFree(lesson) {
    try {
      await api.put(`/admin/lessons/${lesson.id}`, { isFree: !lesson.is_free }, token);
      loadLessons();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(lesson) {
    setEditingId(lesson.id);
    setDraft({ title: lesson.title, content: JSON.stringify(lesson, null, 2) });
  }

  async function saveEdit(lesson) {
    try {
      await api.put(`/admin/lessons/${lesson.id}`, { title: draft.title }, token);
      setEditingId(null);
      loadLessons();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = lessons.filter((l) => l.age_group === ageGroup);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Lessons Manager</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setAgeGroup('junior')}
          style={{ padding: '8px 18px', borderRadius: 999, border: 'none', fontWeight: 800, cursor: 'pointer', background: ageGroup === 'junior' ? 'var(--admin-accent)' : 'rgba(255,255,255,0.08)', color: '#fff' }}
        >
          Junior (45)
        </button>
        <button
          onClick={() => setAgeGroup('explorer')}
          style={{ padding: '8px 18px', borderRadius: 999, border: 'none', fontWeight: 800, cursor: 'pointer', background: ageGroup === 'explorer' ? 'var(--admin-accent)' : 'rgba(255,255,255,0.08)', color: '#fff' }}
        >
          Explorer (45)
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Title</th><th>Arabic Word</th><th>Free?</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td>{l.lesson_number}</td>
                <td>
                  {editingId === l.id ? (
                    <input
                      className="admin-input"
                      style={{ marginBottom: 0, padding: '6px 10px' }}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  ) : (
                    l.title
                  )}
                </td>
                <td className="arabic-text">{l.arabic_word}</td>
                <td>{l.is_free ? 'Free' : 'Paid'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {editingId === l.id ? (
                    <>
                      <button onClick={() => saveEdit(l)} style={actionBtnStyle}>Save</button>
                      <button onClick={() => setEditingId(null)} style={actionBtnStyleOutline}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(l)} style={actionBtnStyleOutline}>Edit Title</button>
                      <button onClick={() => toggleFree(l)} style={actionBtnStyleOutline}>
                        Mark as {l.is_free ? 'Paid' : 'Free'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  padding: '6px 14px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--admin-accent)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const actionBtnStyleOutline = {
  ...actionBtnStyle,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#dbe4ee',
};
