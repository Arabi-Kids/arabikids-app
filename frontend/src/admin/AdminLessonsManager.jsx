import { useEffect, useState } from 'react';
import {
  listAdminLevelsAndStages,
  listAdminLessonsForStage,
  createLesson,
  updateLesson,
  deleteLesson,
  updateStage,
  updateLevel,
} from '../lib/adminDb.js';

const NEW_LESSON_TEMPLATE = {
  title: '',
  lesson_goal: '',
  arabic_word: '',
  arabic_word_meaning: '',
  is_free: false,
  estimated_minutes: 8,
  contentText: JSON.stringify(
    { type: 'vocabulary', concept: '', quranicConnection: { arabic: '', translation: '', reference: '', note: '' } },
    null,
    2
  ),
};

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

  const [editingLevel, setEditingLevel] = useState(false);
  const [levelDraft, setLevelDraft] = useState({ name: '', description: '' });
  const [editingStage, setEditingStage] = useState(false);
  const [stageDraft, setStageDraft] = useState({ name: '', min_placement_age: '', is_free: false });

  const [creatingLesson, setCreatingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState(NEW_LESSON_TEMPLATE);
  const [newLessonError, setNewLessonError] = useState('');

  function loadCurriculum() {
    return listAdminLevelsAndStages().then(({ levels: lv, stages: st }) => {
      setLevels(lv);
      setStages(st);
      return { lv, st };
    });
  }

  useEffect(() => {
    loadCurriculum()
      .then(({ lv, st }) => {
        setSelectedLevelId((prev) => prev ?? lv[0]?.id ?? null);
        const firstStage = st.filter((s) => s.level_id === (selectedLevelId ?? lv[0]?.id))[0];
        setSelectedStageId((prev) => prev ?? firstStage?.id ?? null);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setEditingLevel(false);
    setEditingStage(false);
    const firstStage = stages.filter((s) => s.level_id === levelId)[0];
    setSelectedStageId(firstStage?.id ?? null);
  }

  function selectStage(stageId) {
    setSelectedStageId(stageId);
    setEditingStage(false);
  }

  const selectedLevel = levels.find((l) => l.id === selectedLevelId);
  const selectedStage = stages.find((s) => s.id === selectedStageId);
  const stagesForLevel = stages.filter((s) => s.level_id === selectedLevelId);

  function startEditLevel() {
    setLevelDraft({ name: selectedLevel.name, description: selectedLevel.description ?? '' });
    setEditingLevel(true);
  }

  async function saveLevel() {
    try {
      await updateLevel(selectedLevel.id, { name: levelDraft.name, description: levelDraft.description });
      setEditingLevel(false);
      await loadCurriculum();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditStage() {
    setStageDraft({
      name: selectedStage.name,
      min_placement_age: selectedStage.min_placement_age ?? '',
      is_free: selectedStage.is_free,
    });
    setEditingStage(true);
  }

  async function saveStage() {
    try {
      await updateStage(selectedStage.id, {
        name: stageDraft.name,
        min_placement_age: stageDraft.min_placement_age === '' ? null : Number(stageDraft.min_placement_age),
        is_free: stageDraft.is_free,
      });
      setEditingStage(false);
      await loadCurriculum();
    } catch (err) {
      setError(err.message);
    }
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

  async function removeLesson(lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This can't be undone.`)) return;
    try {
      await deleteLesson(lesson.id);
      loadLessons(selectedStageId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitNewLesson() {
    let parsedContent;
    try {
      parsedContent = JSON.parse(newLesson.contentText);
    } catch {
      setNewLessonError('Content must be valid JSON.');
      return;
    }
    if (!newLesson.title || !newLesson.lesson_goal || !newLesson.arabic_word || !newLesson.arabic_word_meaning) {
      setNewLessonError('Title, goal, Arabic word, and meaning are all required.');
      return;
    }
    try {
      await createLesson(selectedStageId, {
        title: newLesson.title,
        lesson_goal: newLesson.lesson_goal,
        arabic_word: newLesson.arabic_word,
        arabic_word_meaning: newLesson.arabic_word_meaning,
        is_free: newLesson.is_free,
        estimated_minutes: Number(newLesson.estimated_minutes) || 8,
        content: parsedContent,
      });
      setCreatingLesson(false);
      setNewLesson(NEW_LESSON_TEMPLATE);
      setNewLessonError('');
      loadLessons(selectedStageId);
    } catch (err) {
      setNewLessonError(err.message);
    }
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 24 }}>Lessons Manager</h1>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
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
        {selectedLevel && !editingLevel && (
          <button onClick={startEditLevel} style={actionBtnStyleOutline}>Edit Level</button>
        )}
      </div>

      {editingLevel && selectedLevel && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <input
              className="admin-input"
              style={{ marginBottom: 0, flex: '1 1 200px' }}
              placeholder="Level name"
              value={levelDraft.name}
              onChange={(e) => setLevelDraft({ ...levelDraft, name: e.target.value })}
            />
            <input
              className="admin-input"
              style={{ marginBottom: 0, flex: '2 1 300px' }}
              placeholder="Description"
              value={levelDraft.description}
              onChange={(e) => setLevelDraft({ ...levelDraft, description: e.target.value })}
            />
          </div>
          <button onClick={saveLevel} style={actionBtnStyle}>Save Level</button>{' '}
          <button onClick={() => setEditingLevel(false)} style={actionBtnStyleOutline}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {stagesForLevel.map((stage) => (
          <button
            key={stage.id}
            onClick={() => selectStage(stage.id)}
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
        {selectedStage && !editingStage && (
          <button onClick={startEditStage} style={actionBtnStyleOutline}>Edit Stage</button>
        )}
      </div>

      {editingStage && selectedStage && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <input
              className="admin-input"
              style={{ marginBottom: 0, flex: '2 1 220px' }}
              placeholder="Stage name"
              value={stageDraft.name}
              onChange={(e) => setStageDraft({ ...stageDraft, name: e.target.value })}
            />
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Min placement age
              <input
                className="admin-input"
                type="number"
                style={{ marginBottom: 0, width: 80 }}
                value={stageDraft.min_placement_age}
                onChange={(e) => setStageDraft({ ...stageDraft, min_placement_age: e.target.value })}
              />
            </label>
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={stageDraft.is_free}
                onChange={(e) => setStageDraft({ ...stageDraft, is_free: e.target.checked })}
              />
              Free stage
            </label>
          </div>
          <button onClick={saveStage} style={actionBtnStyle}>Save Stage</button>{' '}
          <button onClick={() => setEditingStage(false)} style={actionBtnStyleOutline}>Cancel</button>
        </div>
      )}

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>{lessons.length} lesson(s)</span>
          {!creatingLesson && (
            <button onClick={() => setCreatingLesson(true)} style={actionBtnStyle}>+ Add Lesson</button>
          )}
        </div>
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
                      <button onClick={() => removeLesson(l)} style={{ ...actionBtnStyleOutline, borderColor: '#e57373', color: '#e57373' }}>
                        Delete
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

      {creatingLesson && (
        <div className="admin-card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: '#fff' }}>New Lesson</h3>
          {newLessonError && <p style={{ color: '#e57373', fontWeight: 700 }}>{newLessonError}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <input
              className="admin-input"
              style={{ marginBottom: 0 }}
              placeholder="Title"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
            />
            <input
              className="admin-input"
              style={{ marginBottom: 0 }}
              placeholder="Lesson goal"
              value={newLesson.lesson_goal}
              onChange={(e) => setNewLesson({ ...newLesson, lesson_goal: e.target.value })}
            />
            <input
              className="admin-input"
              style={{ marginBottom: 0 }}
              placeholder="Arabic word"
              value={newLesson.arabic_word}
              onChange={(e) => setNewLesson({ ...newLesson, arabic_word: e.target.value })}
            />
            <input
              className="admin-input"
              style={{ marginBottom: 0 }}
              placeholder="Arabic word meaning"
              value={newLesson.arabic_word_meaning}
              onChange={(e) => setNewLesson({ ...newLesson, arabic_word_meaning: e.target.value })}
            />
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Estimated minutes
              <input
                className="admin-input"
                type="number"
                style={{ marginBottom: 0, width: 80 }}
                value={newLesson.estimated_minutes}
                onChange={(e) => setNewLesson({ ...newLesson, estimated_minutes: e.target.value })}
              />
            </label>
            <label style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={newLesson.is_free}
                onChange={(e) => setNewLesson({ ...newLesson, is_free: e.target.checked })}
              />
              Free lesson
            </label>
          </div>
          <p style={{ color: 'var(--admin-muted)', marginBottom: 6, fontSize: '0.85rem' }}>Content (JSON)</p>
          <textarea
            className="admin-input"
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
            value={newLesson.contentText}
            onChange={(e) => setNewLesson({ ...newLesson, contentText: e.target.value })}
          />
          <div style={{ marginTop: 12 }}>
            <button onClick={submitNewLesson} style={actionBtnStyle}>Create Lesson</button>{' '}
            <button
              onClick={() => { setCreatingLesson(false); setNewLesson(NEW_LESSON_TEMPLATE); setNewLessonError(''); }}
              style={actionBtnStyleOutline}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
