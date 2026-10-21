import { useMemo, useState } from 'react';
import CharacterAvatar from '../characters/CharacterAvatar.jsx';
import CharacterIntro from '../characters/CharacterIntro.jsx';
import LessonStepper from '../LessonStepper.jsx';
import PronunciationCheck from '../PronunciationCheck.jsx';
import RewardStep from './RewardStep.jsx';
import { ArabicHearCard, AudioStatus, SceneIcon, SpeakerIcon } from './shared.jsx';
import { localized, shuffled, titleOf, meaningOf } from '../../lib/contentHelpers.js';
import { playTap, playSuccess } from '../../lib/sounds.js';
import { CHARACTERS, characterName } from '../../lib/characters.config.js';

/** "When do I say it?": a scene appears, the child taps the matching dua. */
function WhenGame({ duas, language, copy, onHear }) {
  const questions = useMemo(() => shuffled(duas), [duas]);
  const [qi, setQi] = useState(0);
  const [wrong, setWrong] = useState(null);
  const done = qi >= questions.length;
  const q = questions[qi];
  const options = useMemo(() => {
    if (!q) return [];
    const others = shuffled(duas.filter((d) => d.id !== q.id)).slice(0, 2);
    return shuffled([q, ...others]);
  }, [q, duas]);

  if (done) {
    return <p style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-green)' }}>{copy.whenDone}</p>;
  }

  function pick(opt) {
    if (opt.id === q.id) {
      playSuccess();
      setWrong(null);
      setQi(qi + 1);
    } else {
      playTap();
      setWrong(opt.id);
      setTimeout(() => setWrong(null), 500);
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><SceneIcon id={q.id} size={84} /></div>
        <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--color-blue)' }}>{titleOf(q, language)}</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8ea0b6' }}>
          {copy.whenProgress.replace('{n}', qi + 1).replace('{total}', questions.length)}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => (
          <div key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <button
              type="button"
              onClick={() => onHear(`${opt.id}.ar`, opt.data.arabic)}
              aria-label={copy.hear}
              className="btn btn-outline"
              style={{ flexShrink: 0 }}
            >
              <SpeakerIcon size={26} />
            </button>
            <button
              type="button"
              onClick={() => pick(opt)}
              style={{
                flex: 1,
                borderRadius: 16,
                padding: '10px 12px',
                cursor: 'pointer',
                border: `3px solid ${wrong === opt.id ? 'var(--color-orange)' : 'var(--color-blue)'}`,
                background: wrong === opt.id ? 'rgba(232,130,60,0.12)' : '#fff',
              }}
            >
              <span className="arabic-text" dir="rtl" style={{ textAlign: 'center', display: 'block', fontSize: '1.3rem', lineHeight: 1.8 }}>
                {opt.data.arabic}
              </span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#4b5a6a' }}>{meaningOf(opt.data, language)}</span>
            </button>
          </div>
        ))}
      </div>
      {wrong && <p style={{ textAlign: 'center', color: '#8394a3', fontWeight: 700 }}>{copy.tryAgain}</p>}
    </div>
  );
}

export default function DuaFlow({ stageNo, items, hostLines, demonstratorId, friendId, language, audio, seen, copy, audioCopy, reward }) {
  const duas = items.filter((i) => i.kind === 'dua');
  const manners = items.filter((i) => i.kind === 'manner');
  const [introDone, setIntroDone] = useState(false);
  const demo = CHARACTERS[demonstratorId];
  const lang = ['ms', 'ar'].includes(language) ? language : 'en';

  const hear = (id, text) => {
    playTap();
    audio.unlock();
    audio.play(id, { fallbackText: text });
  };

  const introLines = hostLines.map((l) => ({ id: l.id, text: localized(l, language) }));
  const stepList = [];

  if (introLines.length) {
    stepList.push({
      key: 'intro',
      node: (
        <div>
          <CharacterIntro
            characterId={demonstratorId}
            lines={introLines}
            vars={{ name: characterName(demonstratorId, language), topic: copy.stageNames[stageNo] }}
            seen={seen}
            audioIdFor={(line) => `intro.${line.id}.stage${stageNo}.${demonstratorId}.${lang}`}
            onDone={() => {
              setIntroDone(true);
              reward.onIntroDone?.();
            }}
          />
          {introDone && <p style={{ textAlign: 'center', color: 'var(--color-green)', fontWeight: 800, marginTop: 12 }}>{copy.introDone}</p>}
        </div>
      ),
    });
  }

  duas.forEach((d) => {
    stepList.push({
      key: d.id,
      node: (
        <div className="card">
          <span className="badge badge-gold">{titleOf(d, language)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '14px 0' }}>
            <SceneIcon id={d.id} size={72} />
            <CharacterAvatar id={demonstratorId} state="point" size={84} />
          </div>
          <ArabicHearCard
            tone="gold"
            arabic={d.data.arabic}
            meaning={meaningOf(d.data, language)}
            hint={copy.tapToHear}
            onHear={() => hear(`${d.id}.ar`, d.data.arabic)}
          />
          <div style={{ marginTop: 14 }}>
            <PronunciationCheck text={d.data.arabic} showListen={false} />
          </div>
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  });

  if (manners.length) {
    stepList.push({
      key: 'manners',
      node: (
        <div className="card">
          <span className="badge badge-teal">{copy.manners}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {manners.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => hear(`${m.id}.${lang}`, localized(m, language))}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2px solid var(--color-teal)',
                  background: 'rgba(26,158,138,0.07)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 900, color: 'var(--color-teal-dark)' }}>{i + 1}</span>
                <span style={{ fontWeight: 700 }}>{localized(m, language)}</span>
              </button>
            ))}
          </div>
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  if (duas.length >= 2) {
    stepList.push({
      key: 'when',
      node: (
        <div className="card">
          <span className="badge badge-purple">{copy.whenBadge}</span>
          <div style={{ marginTop: 12 }}>
            <WhenGame duas={duas} language={language} copy={copy} onHear={hear} />
          </div>
        </div>
      ),
    });
  }

  stepList.push({
    key: 'reward',
    node: (
      <RewardStep
        demonstratorId={demonstratorId}
        friendId={friendId}
        copy={copy}
        stickerLabel={copy.duaSticker.replace('{n}', duas.length)}
        completed={reward.completed}
        submitting={reward.submitting}
        error={reward.error}
        onFinish={reward.onFinish}
        cheering={reward.cheering}
      />
    ),
  });

  return <LessonStepper key={`dua-${stageNo}`} steps={stepList} />;
}
