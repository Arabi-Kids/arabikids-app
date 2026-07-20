import { useState } from 'react';
import { speakSmart } from '../lib/speech.js';

// Forces the browser's own Arabic shaping engine to render the letter in a
// given joined form using zero-width joiners, instead of hand-coding
// Presentation-Forms-B codepoints for all 28 letters by hand (error-prone
// to transcribe correctly from memory, and unnecessary - every modern
// browser already implements real Arabic contextual shaping).
const ZWJ = '‍';
const SHAPES = {
  initial: (letter) => letter + ZWJ,
  medial: (letter) => ZWJ + letter + ZWJ,
  final: (letter) => ZWJ + letter,
};
const LABELS = { initial: 'Start', medial: 'Middle', final: 'End' };

export default function LetterPositions({ letter, positions }) {
  const [active, setActive] = useState(null);
  if (!positions) return null;

  const order = ['initial', 'medial', 'final'].filter((pos) => positions[pos]);
  if (order.length === 0) return null;

  const activeInfo = active ? positions[active] : null;

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#8ea0b6' }}>Shapes in a word:</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {order.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => {
              setActive(pos);
              speakSmart(positions[pos].word, { rate: 0.6 });
            }}
            style={{
              background: active === pos ? 'rgba(27,79,138,0.1)' : '#fff',
              border: `2px solid ${active === pos ? 'var(--color-blue)' : 'rgba(27,79,138,0.2)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: 56,
            }}
          >
            <p className="arabic-text" dir="rtl" style={{ fontSize: '1.5rem', margin: '0 0 2px' }}>
              {SHAPES[pos](letter)}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>{LABELS[pos]}</p>
          </button>
        ))}
      </div>

      {activeInfo && (
        <div style={{ marginTop: 10 }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: '1.4rem', margin: '0 0 2px' }}>{activeInfo.word}</p>
          <p style={{ margin: '0 0 2px', fontStyle: 'italic', color: '#8ea0b6', fontSize: '0.85rem' }}>
            "{activeInfo.transliteration}" — {activeInfo.meaning}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#8ea0b6' }}>{activeInfo.reference}</p>
        </div>
      )}
    </div>
  );
}
