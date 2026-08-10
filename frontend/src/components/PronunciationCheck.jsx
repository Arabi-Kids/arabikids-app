import { useState } from 'react';
import { isSpeechRecognitionSupported, listenOnce, scorePronunciation } from '../lib/speechRecognition.js';
import { speakSmart } from '../lib/speech.js';
import { playTap, playSuccess } from '../lib/sounds.js';
import { useCelebrate } from '../hooks/useCelebrate.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PronunciationCheck({ text, compact = false }) {
  const [status, setStatus] = useState('idle'); // idle | listening | scored | error
  const [result, setResult] = useState(null);
  const [isCheering, triggerCheer] = useCelebrate();
  const { t } = useLanguage();
  const copy = t('pronunciationCheck');
  const FEEDBACK = {
    3: { stars: '🌟🌟🌟', message: copy.excellent },
    2: { stars: '🌟🌟', message: copy.goodTry },
    1: { stars: '🌟', message: copy.keepPracticing },
  };

  if (!isSpeechRecognitionSupported() || !text) return null;

  async function handleTry() {
    setStatus('listening');
    setResult(null);
    try {
      const transcripts = await listenOnce();
      const scored = scorePronunciation(text, transcripts);
      setResult(scored);
      setStatus('scored');
      // 1 star is "keep practicing", not a win - only cheer for 2-3 stars so
      // the celebration always means something real, not participation.
      if (scored.stars >= 2) {
        playSuccess();
        triggerCheer();
      }
    } catch {
      setStatus('error');
    }
  }

  const buttons = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: compact ? 6 : 12, marginBottom: compact ? 4 : 12 }}>
      <button
        type="button"
        className={compact ? undefined : 'btn btn-secondary'}
        onClick={() => { playTap(); speakSmart(text, { rate: 0.7 }); }}
        style={compact ? COMPACT_BTN_STYLE : undefined}
      >
        🔊{compact ? '' : copy.listen}
      </button>
      <button
        type="button"
        className={compact ? undefined : 'btn btn-primary'}
        onClick={handleTry}
        disabled={status === 'listening'}
        style={compact ? { ...COMPACT_BTN_STYLE, borderColor: 'var(--color-gold)' } : undefined}
      >
        {status === 'listening' ? '🎤…' : compact ? '🎤' : copy.tapToSpeak}
      </button>
    </div>
  );

  if (compact) {
    return (
      <div style={{ marginTop: 6 }}>
        {buttons}
        {status === 'scored' && result && (
          <p className={isCheering ? 'mascot-cheer' : ''} style={{ margin: 0, fontSize: '0.9rem' }}>
            {FEEDBACK[result.stars].stars}
          </p>
        )}
        {status === 'error' && <p style={{ margin: 0, fontSize: '0.7rem', color: '#8ea0b6' }}>{copy.couldntHear}</p>}
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
      <span className="badge badge-gold">{copy.title}</span>
      <p style={{ margin: '10px 0 16px', color: '#4b5a6a' }}>{copy.subtitle}</p>

      {buttons}

      {status === 'scored' && result && (
        <div>
          <p className={isCheering ? 'mascot-cheer' : ''} style={{ fontSize: '1.5rem', margin: '4px 0' }}>
            {FEEDBACK[result.stars].stars}
          </p>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>{FEEDBACK[result.stars].message}</p>
        </div>
      )}

      {status === 'error' && (
        <p style={{ margin: 0, color: '#8ea0b6', fontSize: '0.9rem' }}>
          {copy.couldntHearClear}
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
