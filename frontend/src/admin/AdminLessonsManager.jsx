import { useEffect, useState } from 'react';
import { listAdminLevelsAndStages, listAdminLessonsForStage, updateLesson } from '../lib/adminDb.js';

export default function AdminLessonsManager() {
  const [levels, setLevels] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: '', contentText: '' });
  const [draftError, setDraftError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    listAdminLevelsAndStages()
      .then(({ levels: lv, stages: st }) => {
        setLevels(lv);
        setStages(st);
        setSelectedLevelId(lv[0]?.id ?? null);
        const firstStage = st.filter((s) => s.level_id === lv[0]?.id)[0];
        setSelectedStageId(firstStage?.id ?? null);
      })
      .catch((err) => setError(err.message));
  }, []);

  function loadLessons(stageId) {
    if (!stageId) return;
    listAdminLessonsForStage(stageId).then(setLessons).catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadLessons(selectedStageId);
  }, [selectedStageId]);

  function selectLevel(levelId) {
    setSelectedLevelId(levelId);
    const firstStage = stages.filter((s) => s.level_id === levelId)[0];
    setSelectedStageId(firstStage?.id ?? null);
  }

  async function toggleFree(lesson) {
    try {
      await updateLesson(lesson.id, { is_free: !lesson.is_free });
      loadLessons(selectedStageId);
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(lesson) {
    setEditingId(lesson.id);
    setDraftError('');
    setDraft({ title: lesson.title, contentText: JSON.stringify(lesson.content, null, 2) });
  }

  async function saveEdit(lesson) {
    let parsedContent;
    try {
      parsedContent = JSON.parse(draft.contentText);
    } catch {
      setDraftError('Content must be valid JSON.');
      return;
    }
    try {
      await updateLesson(lesson.id, { title: draft.title, content: parsedContent });
      setEditingId(null);
      setDraftError('');
      loadLessons(selectedStageId);
    } catch (err) {
      setError(err.message);
    }
  }

  const stagesForLevel = stages.filter((s) => s.level_id === selectedLevelId);

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Lessons Manager</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => selectLevel(level.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: selectedLevelId === level.id ? 'var(--admin-accent)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
            }}
          >
            {level.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {stagesForLevel.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStageId(stage.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: selectedStageId === stage.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: selectedStageId === stage.id ? 'var(--admin-accent)' : 'transparent',
              color: selectedStageId === stage.id ? '#fff' : 'var(--admin-muted)',
            }}
          >
            Stage {stage.order_index}: {stage.name}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Title</th><th>Arabic Word</th><th>Free?</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id}>
                <td>{l.order_index}</td>
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
                      <button onClick={() => { setEditingId(null); setDraftError(''); }} style={actionBtnStyleOutline}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(l)} style={actionBtnStyleOutline}>Edit</button>
                      <button onClick={() => toggleFree(l)} style={actionBtnStyleOutline}>
                        Mark as {l.is_free ? 'Paid' : 'Free'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>No lessons in this stage.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="admin-card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: '#fff' }}>Lesson Content (JSON)</h3>
          <p style={{ color: 'var(--admin-muted)', marginTop: -8 }}>
            Edit the lesson's concept, Quranic connection, etc. Must stay valid JSON.
          </p>
          {draftError && <p style={{ color: '#e57373', fontWeight: 700 }}>{draftError}</p>}
          <textarea
            className="admin-input"
            rows={16}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
            value={draft.contentText}
            onChange={(e) => setDraft({ ...draft, contentText: e.target.value })}
          />
        </div>
      )}
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
