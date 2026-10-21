import { useEffect, useRef, useState } from 'react';
import { duckMusic, unduckMusic } from '../lib/music.js';

/** "Sing along" button: plays one short song file, pausing the background music. */
export default function SongButton({ src, label, stopLabel }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      unduckMusic();
    },
    []
  );

  function toggle() {
    let audio = audioRef.current;
    if (playing && audio) {
      audio.pause();
      return;
    }
    if (!audio) {
      audio = new Audio(src);
      audioRef.current = audio;
      audio.addEventListener('playing', () => {
        setPlaying(true);
        duckMusic(0);
      });
      for (const ev of ['ended', 'pause', 'error']) {
        audio.addEventListener(ev, () => {
          setPlaying(false);
          unduckMusic();
        });
      }
    }
    audio.currentTime = 0;
    audio.play().catch(() => setPlaying(false));
  }

  return (
    <button type="button" className="btn btn-secondary btn-chunky" style={{ marginTop: 14 }} onClick={toggle}>
      {playing ? `⏹ ${stopLabel}` : `🎵 ${label}`}
    </button>
  );
}
