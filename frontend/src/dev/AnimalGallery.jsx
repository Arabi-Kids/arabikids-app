// DEV ONLY - contact sheet of every letter-word illustration.
// /dev/animals shows large cards; /dev/animals?s=84 packs them small.
import AnimalArt, { LETTER_ART, ART_KEYS } from '../components/animals/AnimalArt.jsx';

export default function AnimalGallery() {
  const q = new URLSearchParams(window.location.search);
  const s = Number(q.get('s')) || 150;
  const only = q.get('only')?.split(',');
  const keys = only ? ART_KEYS.filter((k) => only.includes(k)) : ART_KEYS;
  const letterOf = Object.fromEntries(Object.entries(LETTER_ART).flatMap(([id, ws]) => (ws ?? []).map((w) => [w, id])));
  return (
    <main style={{ padding: 10, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0, fontSize: s < 100 ? '1rem' : undefined }}>Letter illustrations ({ART_KEYS.length} drawn)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${s + 24}px, 1fr))`, gap: 8 }}>
        {keys.map((k) => (
          <div key={k} style={{ background: '#e7eff9', border: '2px solid #1b4f8a', borderRadius: 18, padding: 6, textAlign: 'center' }}>
            <AnimalArt name={k} size={s} label={k} />
            <div style={{ fontSize: 12 }}><b>{k}</b> <small>{letterOf[k]}</small></div>
          </div>
        ))}
      </div>
    </main>
  );
}
