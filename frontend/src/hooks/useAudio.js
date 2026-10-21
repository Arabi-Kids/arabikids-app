import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { loadManifest, getClip, playClip, stopClip, unlockAudio, isUnlocked } from '../lib/audioManager.js';
import { speakInLanguage } from '../lib/speech.js';

/** React front for audioManager.
 *
 *  play(audioId, { fallbackText, onStart, onEnd }) ->
 *    'played'       approved clip is playing
 *    'preview'      admin-only pending clip is playing (badge it)
 *    'tts-preview'  no clip; admin heard device TTS (badge it)
 *    'missing'      no clip; show "audio coming soon" text state
 *    'locked'       audio not unlocked yet (no tap has happened)
 *
 *  `status` is what the UI should render as a small badge:
 *  null | 'coming-soon' | 'preview' | 'tts-preview'. */
export default function useAudio() {
  const { isAdmin } = useAuth();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadManifest().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      stopClip();
    };
  }, []);

  const flash = useCallback((next) => {
    setStatus(next);
    clearTimeout(timer.current);
    if (next) timer.current = setTimeout(() => setStatus(null), 2600);
  }, []);

  const has = useCallback((audioId) => !!getClip(audioId), [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = useCallback(
    (audioId, { fallbackText, onStart, onEnd, rate } = {}) => {
      const result = playClip(audioId, { onStart, onEnd, rate });
      if (result === 'played') {
        flash(null);
        return 'played';
      }
      if (result === 'preview') {
        flash('preview');
        return 'preview';
      }
      if (result === 'locked') return 'locked';
      // Missing clip: only an admin preview ever falls back to device TTS.
      if (isAdmin() && fallbackText) {
        // Voice follows the clip's own language (id ends .ar / .en / .ms).
        const lang = /\.(ar|en|ms)$/.exec(audioId)?.[1] ?? 'en';
        speakInLanguage(fallbackText, lang, { rate: 0.8, onStart, onEnd });
        flash('tts-preview');
        return 'tts-preview';
      }
      flash('coming-soon');
      onEnd?.();
      return 'missing';
    },
    [flash, isAdmin]
  );

  return { ready, has, play, stop: stopClip, unlock: unlockAudio, isUnlocked, status };
}
