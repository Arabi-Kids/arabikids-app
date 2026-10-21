import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { startMusic, stopMusic, isMusicMuted, setMusicMuted } from '../lib/music.js';

const LABELS = {
  en: { on: 'Music on', off: 'Music off' },
  ar: { on: 'الموسيقى تعمل', off: 'الموسيقى متوقفة' },
  ms: { on: 'Muzik dipasang', off: 'Muzik ditutup' },
};

function NoteIcon({ off }) {
  return (
    <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
      <path d="M12 23 V8 L25 5 V20" fill="none" stroke="#1B4F8A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="9.5" cy="23.5" rx="4.2" ry="3.2" fill="#1B4F8A" />
      <ellipse cx="22.5" cy="20.5" rx="4.2" ry="3.2" fill="#1B4F8A" />
      {off && <path d="M5 5 L27 27" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}

/** Starts the lesson music on the first tap of the page, stops it when the page
 * is left, and shows a small on/off button. mood: 'play' | 'calm'. */
export default function MusicToggle({ mood = 'play' }) {
  const { language } = useLanguage();
  const [off, setOff] = useState(isMusicMuted());
  const text = LABELS[language] ?? LABELS.en;

  useEffect(() => {
    const begin = () => startMusic(mood);
    window.addEventListener('pointerdown', begin, { once: true });
    return () => {
      window.removeEventListener('pointerdown', begin);
      stopMusic();
    };
  }, [mood]);

  const toggle = () => {
    const next = !off;
    setOff(next);
    setMusicMuted(next);
    if (!next) startMusic(mood);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={off ? text.off : text.on}
      aria-pressed={!off}
      title={off ? text.off : text.on}
      style={{
        position: 'fixed',
        insetInlineStart: 14,
        bottom: 14,
        zIndex: 40,
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: '3px solid var(--color-blue)',
        background: 'var(--color-sky)',
        boxShadow: '0 3px 0 var(--color-blue-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <NoteIcon off={off} />
    </button>
  );
}
