import { useEffect, useMemo, useState } from 'react';
import { listContentForReview, setContentReview } from '../lib/adminContent.js';

const KINDS = [
  'letter', 'position', 'host_line', 'reaction',
  'wudu_lesson', 'wudu_step', 'wudu_intention', 'wudu_dua', 'wudu_breaker',
  'prayer_time', 'movement', 'phrase', 'surah_verse', 'prayer_order', 'dua', 'manner', 'dhikr',
];

const STATUS_COLORS = { draft: '#c8960c', review: '#6aa7ff', approved: '#4caf7a' };

// Columns shown per row: everything except bookkeeping, Arabic first.
function previewFields(data) {
  return Object.entries(data).filter(([k, v]) => typeof v === 'string' && v && k !== 'id');
}

function isArabic(text) {
  return /[؀-ۿ]/.test(text);
}

export default function AdminContentReview() {
  const [kind, setKind] = useState('letter');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setError('');
    listContentForReview({ kind, status })
      .then((data) => {
        setRows(data);
        setSelected([]);
        setNotes(Object.fromEntries(data.map((r) => [r.id, r.review_note ?? ''])));
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [kind, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = { draft: 0, review: 0, approved: 0 };
    rows.forEach((r) => { c[r.review_status] += 1; });
    return c;
  }, [rows]);

  async function apply(ids, nextStatus) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await setContentReview(ids, { status: nextStatus });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(id) {
    try {
      await setContentReview([id], { status: rows.find((r) => r.id === id).review_status, note: notes[id] });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 6 }}>Content Review</h1>
      <p style={{ color: 'var(--admin-muted)', marginTop: 0 }}>
        Items from the content pack arrive as <b>draft</b>. Only <b>approved</b> items appear to children.
        Arabic is shown exactly as imported and cannot be edited here: if something looks wrong, add a note.
      </p>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <select className="admin-input" style={{ maxWidth: 220, marginBottom: 0 }} value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select className="admin-input" style={{ maxWidth: 180, marginBottom: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In review</option>
          <option value="approved">Approved</option>
        </select>
        <span style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
          {rows.length} items · {counts.draft} draft · {counts.review} review · {counts.approved} approved
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button disabled={busy || !selected.length} onClick={() => apply(selected, 'approved')} style={btn('#4caf7a')}>
          Approve selected ({selected.length})
        </button>
        <button disabled={busy || !selected.length} onClick={() => apply(selected, 'review')} style={btn('#6aa7ff')}>
          Send to review
        </button>
        <button disabled={busy || !selected.length} onClick={() => apply(selected, 'draft')} style={btn('#8a94a3')}>
          Back to draft
        </button>
        <button onClick={() => setSelected(rows.map((r) => r.id))} style={btn('transparent', true)}>Select all</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r) => (
          <div key={r.id} className="admin-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[r.review_status]}` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} style={{ marginTop: 6 }} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ margin: 0, fontWeight: 800, color: '#fff' }}>
                  {r.id}
                  <span style={{ marginLeft: 8, color: STATUS_COLORS[r.review_status], fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {r.review_status}
                  </span>
                  {r.stage_no != null && <span style={{ marginLeft: 8, color: 'var(--admin-muted)', fontSize: '0.8rem' }}>stage {r.stage_no}</span>}
                  {r.is_free && <span style={{ marginLeft: 8, color: '#4caf7a', fontSize: '0.8rem' }}>free</span>}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px 16px', marginTop: 8 }}>
                  {previewFields(r.data).map(([k, v]) => (
                    <div key={k}>
                      <span style={{ color: 'var(--admin-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{k}</span>
                      <div dir={isArabic(v) ? 'rtl' : 'ltr'} className={isArabic(v) ? 'arabic-text' : undefined} style={{ color: '#dbe4ee', fontSize: isArabic(v) ? '1.25rem' : '0.9rem' }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    className="admin-input"
                    style={{ marginBottom: 0, flex: 1 }}
                    placeholder="Reviewer note"
                    value={notes[r.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                  />
                  <button onClick={() => saveNote(r.id)} style={btn('transparent', true)}>Save note</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button disabled={busy || r.review_status === 'approved'} onClick={() => apply([r.id], 'approved')} style={btn('#4caf7a')}>Approve</button>
                <button disabled={busy || r.review_status === 'draft'} onClick={() => apply([r.id], 'draft')} style={btn('#8a94a3')}>Draft</button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
            No items. Run <code>node scripts/import-content-pack.mjs</code> to import the content pack.
          </div>
        )}
      </div>
    </div>
  );
}

function btn(color, outline = false) {
  return {
    padding: '8px 14px',
    borderRadius: 10,
    fontWeight: 800,
    cursor: 'pointer',
    border: outline ? '1px solid rgba(255,255,255,0.2)' : 'none',
    background: outline ? 'transparent' : color,
    color: outline ? '#dbe4ee' : '#fff',
  };
}
