import { useState } from 'react';
import { isSpeechRecognitionSupported, listenOnce, scorePronunciation } from '../lib/speechRecognition.js';
import { speakSmart } from '../lib/speech.js';

const FEEDBACK = {
  3: { stars: '🌟🌟🌟', message: 'Excellent!' },
  2: { stars: '🌟🌟', message: 'Good try!' },
  1: { stars: '🌟', message: 'Keep practicing!' },
};

export default function PronunciationCheck({ text, compact = false }) {
  const [status, setStatus] = useState('idle'); // idle | listening | scored | error
  const [result, setResult] = useState(null);

  if (!isSpeechRecognitionSupported() || !text) return null;

  async function handleTry() {
    setStatus('listening');
    setResult(null);
    try {
      const transcripts = await listenOnce();
      setResult(scorePronunciation(text, transcripts));
      setStatus('scored');
    } catch {
      setStatus('error');
    }
  }

  const buttons = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: compact ? 6 : 12, marginBottom: compact ? 4 : 12 }}>
      <button
        type="button"
        className={compact ? undefined : 'btn btn-secondary'}
        onClick={() => speakSmart(text, { rate: 0.7 })}
        style={compact ? COMPACT_BTN_STYLE : undefined}
      >
        🔊{compact ? '' : ' Listen'}
      </button>
      <button
        type="button"
        className={compact ? undefined : 'btn btn-primary'}
        onClick={handleTry}
        disabled={status === 'listening'}
        style={compact ? { ...COMPACT_BTN_STYLE, borderColor: 'var(--color-gold)' } : undefined}
      >
        {status === 'listening' ? '🎤…' : compact ? '🎤' : '🎤 Tap to Speak'}
      </button>
    </div>
  );

  if (compact) {
    return (
      <div style={{ marginTop: 6 }}>
        {buttons}
        {status === 'scored' && result && (
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{FEEDBACK[result.stars].stars}</p>
        )}
        {status === 'error' && <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>Couldn't hear that.</p>}
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
      <span className="badge badge-gold">Practice Pronunciation</span>
      <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>Listen, then repeat it into your microphone.</p>

      {buttons}

      {status === 'scored' && result && (
        <div>
          <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>{FEEDBACK[result.stars].stars}</p>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>{FEEDBACK[result.stars].message}</p>
        </div>
      )}

      {status === 'error' && (
        <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.9rem' }}>
          Couldn't hear that clearly — check your microphone and try again.
        </p>
      )}
    </div>
  );
}

const COMPACT_BTN_STYLE = {
  background: '#fff',
  border: '2px solid var(--color-blue)',
  borderRadius: 999,
  width: 32,
  height: 32,
  fontSize: '0.9rem',
  cursor: 'pointer',
  lineHeight: 1,
};
