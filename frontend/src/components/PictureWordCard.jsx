import SpeakButton from './SpeakButton.jsx';
import HudMascot from './HudMascot.jsx';
import { VOCAB_ICONS } from './VocabIcons.jsx';

const BADGE_STYLE = { borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', flexShrink: 0 };

/** Renders the picture reference: a real icon/color/number when
 * content.image is set, otherwise a generic first-letter badge so every
 * lesson gets a picture-card treatment automatically, not just the ~22
 * lessons with a hand-picked illustration (see Lesson.jsx's original
 * ImageBadge, which this generalizes with the placeholder fallback). */
function ImageBadge({ image, fallbackLetter, size }) {
  const style = { ...BADGE_STYLE, width: size, height: size };
  if (image?.type === 'color') {
    return <div style={{ ...style, background: image.hex, border: '3px solid rgba(0,0,0,0.08)' }} />;
  }
  if (image?.type === 'number') {
    return (
      <div style={{ ...style, background: 'var(--color-sky)', color: 'var(--color-blue)', fontSize: size * 0.42, fontWeight: 900 }}>
        {image.value}
      </div>
    );
  }
  if (image?.type === 'icon') {
    const Icon = VOCAB_ICONS[image.key];
    if (Icon) {
      return (
        <div style={{ ...style, background: 'var(--color-sky)', color: 'var(--color-blue)' }}>
          <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
        </div>
      );
    }
  }
  return (
    <div className="arabic-text" style={{ ...style, background: 'var(--color-sky)', color: 'var(--color-blue)', fontSize: size * 0.45, fontWeight: 900 }}>
      {fallbackLetter}
    </div>
  );
}

function highlightLetter(word, letter) {
  if (!letter || !word?.includes(letter)) return word;
  const i = word.indexOf(letter);
  return (
    <>
      {word.slice(0, i)}
      <span style={{ color: 'var(--color-gold)' }}>{letter}</span>
      {word.slice(i + letter.length)}
    </>
  );
}

const MASCOTS = { hud: HudMascot };

/** The core "picture-word-sound card" used across the Arabic Curriculum:
 * illustration + Arabic word (with an optional highlighted letter) +
 * tap-to-hear (via SpeakButton, unlimited repeat) + a mascot "presenting"
 * it. The mascot presentation is a layout composition (mascot beside a
 * speech-bubble-styled card), not a new SVG pose - no mascot has a
 * "holding a card" pose today and hand-authoring new SVG path data isn't
 * reliable to do well here. */
export default function PictureWordCard({ arabicWord, meaning, transliteration, image, letterHighlight, mascot = 'hud', size = 'lg' }) {
  const Mascot = mascot ? MASCOTS[mascot] : null;
  const dims = size === 'sm' ? { badge: 56, mascotSize: 40, word: '1.5rem' } : { badge: 84, mascotSize: 56, word: '2.2rem' };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 20 }}>
      {Mascot && (
        <div style={{ flexShrink: 0, transform: 'rotate(-4deg)' }}>
          <Mascot pose="hero" size={dims.mascotSize} />
        </div>
      )}
      <div className="card" style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: -8,
            bottom: 14,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '10px solid #fff',
          }}
        />
        <ImageBadge image={image} fallbackLetter={arabicWord?.[0]} size={dims.badge} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '14px 0 4px' }}>
          <p className="arabic-text" dir="rtl" style={{ fontSize: dims.word, margin: 0 }}>
            {highlightLetter(arabicWord, letterHighlight)}
          </p>
          <SpeakButton text={arabicWord} size={20} />
        </div>
        {transliteration && (
          <p style={{ margin: '0 0 2px', color: '#8ea0b6', fontStyle: 'italic', fontSize: '0.9rem' }}>"{transliteration}"</p>
        )}
        {meaning && <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-blue)' }}>{meaning}</p>}
      </div>
    </div>
  );
}
