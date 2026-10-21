import { useEffect, useState } from 'react';
import { listAudioAssets, updateAudioAsset } from '../lib/adminContent.js';

const STATUS_COLORS = { pending: '#c8960c', approved: '#4caf7a', rejected: '#e57373' };

function isArabic(text) {
  return /[؀-ۿ]/.test(text || '');
}

function Row({ clip, onSaved, onError }) {
  const [fileUrl, setFileUrl] = useState(clip.file_url ?? '');
  const [notes, setNotes] = useState(clip.notes ?? '');
  const [license, setLicense] = useState(clip.license_note ?? '');
  const [source, setSource] = useState(clip.source_type);
  const [busy, setBusy] = useState(false);

  async function save(patch) {
    setBusy(true);
    try {
      await updateAudioAsset(clip.id, {
        file_url: fileUrl || null,
        notes: notes || null,
        license_note: license || null,
        source_type: source,
        ...patch,
      });
      onSaved();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const canApprove = !!fileUrl;

  return (
    <div className="admin-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[clip.status]}` }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#fff' }}>
            {clip.id}
            <span style={{ marginLeft: 8, color: STATUS_COLORS[clip.status], fontSize: '0.8rem', textTransform: 'uppercase' }}>{clip.status}</span>
            <span style={{ marginLeft: 8, color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{clip.language}</span>
          </p>
          {clip.script_text && (
            <p
              dir={isArabic(clip.script_text) ? 'rtl' : 'ltr'}
              className={isArabic(clip.script_text) ? 'arabic-text' : undefined}
              style={{ margin: '8px 0', color: '#dbe4ee', fontSize: isArabic(clip.script_text) ? '1.4rem' : '0.95rem' }}
            >
              {clip.script_text}
            </p>
          )}
          {clip.file_url ? (
            <audio controls preload="none" src={clip.file_url} style={{ width: '100%', maxWidth: 360 }} />
          ) : (
            <p style={{ margin: 0, color: 'var(--admin-muted)', fontSize: '0.8rem' }}>No file yet. Set a file path to enable playback.</p>
          )}
        </div>

        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input className="admin-input" style={{ marginBottom: 0 }} placeholder="/audio/pack/L01.name.ar.mp3" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          <select className="admin-input" style={{ marginBottom: 0 }} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="voicestudio">VoiceStudio (offline)</option>
            <option value="human">Human recording</option>
            <option value="licensed">Licensed</option>
            <option value="sfx">SFX (CC0 / licensed)</option>
          </select>
          <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Licence note" value={license} onChange={(e) => setLicense(e.target.value)} />
          <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Reviewer note" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button disabled={busy || !canApprove} onClick={() => save({ status: 'approved' })} style={actionBtn('#4caf7a')}>Approve</button>
          <button disabled={busy} onClick={() => save({ status: 'rejected' })} style={actionBtn('#e57373')}>Reject</button>
          <button disabled={busy} onClick={() => save({ status: 'pending' })} style={actionBtn('#8a94a3')}>Pending</button>
          <button disabled={busy} onClick={() => save({})} style={actionBtn('transparent', true)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAudioReview() {
  const [clips, setClips] = useState([]);
  const [status, setStatus] = useState('pending');
  const [language, setLanguage] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  function load() {
    listAudioAssets({ status, language, search })
      .then((rows) => { setClips(rows); setError(''); })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [status, language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 900, marginBottom: 6 }}>Audio Review</h1>
      <p style={{ color: 'var(--admin-muted)', marginTop: 0 }}>
        The app only plays <b>approved</b> clips. Pending or rejected clips show the text with an “audio coming soon” state.
        Qur’anic audio needs written permission from the licensor before it can be approved.
      </p>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <select className="admin-input" style={{ maxWidth: 170, marginBottom: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="admin-input" style={{ maxWidth: 150, marginBottom: 0 }} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="all">All languages</option>
          <option value="ar">Arabic</option>
          <option value="en">English</option>
          <option value="ms">Malay</option>
          <option value="sfx">SFX</option>
        </select>
        <input
          className="admin-input"
          style={{ maxWidth: 240, marginBottom: 0 }}
          placeholder="Search audio_id (e.g. L01)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button onClick={load} style={actionBtn('transparent', true)}>Search</button>
      </div>

      <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>{clips.length} clips shown</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {clips.map((c) => (
          <Row key={`${c.id}-${c.updated_at}`} clip={c} onSaved={load} onError={setError} />
        ))}
        {clips.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
            No clips. Import the content pack to create the manifest.
          </div>
        )}
      </div>
    </div>
  );
}

function actionBtn(color, outline = false) {
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
