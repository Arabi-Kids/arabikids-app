import { useState } from 'react';
import { isSpeechRecognitionSupported, listenOnce, scorePronunciation } from '../lib/speechRecognition.js';
import { speakSmart } from '../lib/speech.js';

const FEEDBACK = {
  3: { stars: '🌟🌟🌟', message: 'Excellent!' },
  2: { stars: '🌟🌟', message: 'Good try!' },
  1: { stars: '🌟', message: 'Keep practicing!' },
};

export default function PronunciationCheck({ text }) {
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

  return (
    <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
      <span className="badge badge-gold">Practice Pronunciation</span>
      <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>Listen, then repeat it into your microphone.</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={() => speakSmart(text, { rate: 0.7 })}>
          🔊 Listen
        </button>
        <button type="button" className="btn btn-primary" onClick={handleTry} disabled={status === 'listening'}>
          {status === 'listening' ? '🎤 Listening…' : '🎤 Tap to Speak'}
        </button>
      </div>

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
