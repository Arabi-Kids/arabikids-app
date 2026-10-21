import { useState } from 'react';
import CharacterAvatar from '../characters/CharacterAvatar.jsx';
import { CHARACTERS } from '../../lib/characters.config.js';
import { setChildDemonstrator } from '../../lib/db.js';
import { useActiveChild } from '../../context/ActiveChildContext.jsx';

/** Asked once per child: who do you want to learn with? Boy profile -> Amir,
 * girl profile -> Nur; the other appears as the friend/cheerer. */
export default function DemonstratorPicker({ copy, onChosen }) {
  const { activeChild, refreshChildren } = useActiveChild();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function choose(id) {
    if (!activeChild) {
      onChosen?.(id);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setChildDemonstrator(activeChild.id, id);
      await refreshChildren();
      onChosen?.(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 6px' }}>{copy.pickTitle}</h2>
      <p style={{ margin: '0 0 16px', color: '#4b5a6a' }}>{copy.pickSubtitle}</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['amir', 'nur'].map((id) => (
          <button
            key={id}
            type="button"
            disabled={saving}
            onClick={() => choose(id)}
            className="card card-kid"
            style={{ cursor: 'pointer', padding: '14px 18px', minWidth: 150 }}
          >
            <CharacterAvatar id={id} state="wave" size={110} />
            <span style={{ display: 'block', fontWeight: 900, color: 'var(--color-blue)', marginTop: 6 }}>
              {CHARACTERS[id].name}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
