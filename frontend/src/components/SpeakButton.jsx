import { useState } from 'react';
import { speakArabic, isSpeechSupported } from '../lib/speech.js';
import { SpeakerIcon } from './Icons.jsx';

export default function SpeakButton({ text, size = 20, rate, style }) {
  const [playing, setPlaying] = useState(false);

  if (!isSpeechSupported() || !text) return null;

  return (
    <button
      type="button"
      aria-label={`Listen to ${text}`}
      onClick={() => speakArabic(text, { rate, onStart: () => setPlaying(true), onEnd: () => setPlaying(false) })}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 12,
        height: size + 12,
        borderRadius: '50%',
        border: 'none',
        background: playing ? 'var(--color-gold)' : 'var(--color-sky)',
        color: playing ? '#fff' : 'var(--color-blue)',
        cursor: 'pointer',
        flexShrink: 0,
        ...style,
      }}
    >
      <SpeakerIcon style={{ width: size, height: size }} />
    </button>
  );
}
