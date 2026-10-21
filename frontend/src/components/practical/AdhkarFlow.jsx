import { useMemo, useState } from 'react';
import LessonStepper from '../LessonStepper.jsx';
import RewardStep from './RewardStep.jsx';
import { AudioStatus } from './shared.jsx';
import { SpeakerIcon, CheckIcon } from '../icons/PracticalIcons.jsx';
import { playTap, playSuccess } from '../../lib/sounds.js';
import { meaningOf } from '../../lib/contentHelpers.js';
import { parseQuranRefs, playRefChain } from '../../lib/quranAudio.js';

// Stage 10: morning and evening adhkar. The Arabic is the reviewed text
// (never written here); the child picks morning or evening, then goes through
// each dhikr: hear it, see its meaning (when the reviewer has supplied one) and
// tap a counter for how many times it is said. The counter never blocks Next.

const fill = (text, vars) => Object.entries(vars).reduce((a, [k, v]) => a.replaceAll(`{${k}}`, String(v)), text);

function SunIcon() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <g stroke="#E7A73E" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return <line key={i} x1={32 + 20 * Math.cos(a)} y1={32 + 20 * Math.sin(a)} x2={32 + 27 * Math.cos(a)} y2={32 + 27 * Math.sin(a)} />;
        })}
      </g>
      <circle cx="32" cy="32" r="14" fill="#FFD23F" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <path d="M42 8 A24 24 0 1 0 56 40 A19 19 0 0 1 42 8 Z" fill="#F2D675" />
      <circle cx="48" cy="14" r="2.4" fill="#FFD23F" /><circle cx="56" cy="26" r="1.8" fill="#FFD23F" />
    </svg>
  );
}

function TimeChooser({ copy, onPick }) {
  const suggested = new Date().getHours() < 15 ? 'morning' : 'evening';
  const options = [
    { key: 'morning', label: copy.morning, icon: <SunIcon /> },
    { key: 'evening', label: copy.evening, icon: <MoonIcon /> },
  ];
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 16px' }}>{copy.chooseTitle}</h3>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => {
              playTap();
              onPick(o.key);
            }}
            style={{
              minWidth: 150,
              padding: '18px 14px',
              borderRadius: 22,
              border: `3px solid ${o.key === suggested ? 'var(--color-gold)' : 'var(--color-blue)'}`,
              background: o.key === suggested ? 'rgba(200,150,12,0.1)' : 'var(--color-sky)',
              boxShadow: '0 4px 0 var(--color-blue-dark)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--color-blue)',
            }}
          >
            <span style={{ display: 'block', lineHeight: 0, marginBottom: 6 }}>{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Counter({ total, copy }) {
  const [n, setN] = useState(0);
  const done = n >= total;
  return (
    <div style={{ textAlign: 'center', marginTop: 16 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 800, color: 'var(--color-blue)' }}>
        {total === 1 ? copy.sayOnce : fill(copy.sayTimes, { n: total })}
      </p>
      <button
        type="button"
        onClick={() => {
          if (done) return;
          const next = n + 1;
          setN(next);
          if (next >= total) playSuccess();
          else playTap();
        }}
        aria-label={copy.tapToCount}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: `4px solid ${done ? 'var(--color-green)' : 'var(--color-blue)'}`,
          background: done ? 'rgba(26,122,74,0.1)' : 'var(--color-sky)',
          boxShadow: '0 4px 0 var(--color-blue-dark)',
          cursor: done ? 'default' : 'pointer',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--color-blue)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? <CheckIcon size={44} /> : n}
      </button>
      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#8394a3', fontWeight: 700 }}>
        {done ? copy.allDone : total > 1 ? fill(copy.counted, { n, total }) : copy.tapToCount}
      </p>
    </div>
  );
}

function DhikrCard({ item, index, total, language, audio, copy, audioCopy }) {
  const d = item.data;
  const meaning = meaningOf(d, language);
  const hear = () => {
    playTap();
    audio.unlock();
    // Qur'an rows play the platform's reciter audio; the rest play their own clip.
    const refs = parseQuranRefs(d.quran);
    if (refs.length && playRefChain(refs, { onError: () => audio.play(`${item.id}.ar`, { fallbackText: d.arabic }) })) return;
    audio.play(`${item.id}.ar`, { fallbackText: d.arabic });
  };
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <span className="badge badge-purple">{fill(copy.stepOf, { i: index + 1, n: total })}</span>
      <div style={{ maxHeight: '36vh', overflowY: 'auto', margin: '14px 0 4px', padding: '0 4px' }}>
        <span className="arabic-text" dir="rtl" style={{ display: 'block', textAlign: 'center', fontSize: d.arabic.length > 160 ? '1.35rem' : '1.8rem', lineHeight: 2 }}>
          {d.arabic}
        </span>
      </div>
      <button
        type="button"
        onClick={hear}
        aria-label="hear"
        style={{ border: '3px solid var(--color-blue)', background: 'var(--color-sky)', borderRadius: 16, padding: '8px 18px', cursor: 'pointer', boxShadow: '0 3px 0 var(--color-blue-dark)' }}
      >
        <SpeakerIcon size={30} />
      </button>
      <AudioStatus status={audio.status} copy={audioCopy} />
      {meaning && <p style={{ margin: '12px 0 0', color: '#4b5a6a', fontWeight: 700 }}>{meaning}</p>}
      <Counter key={item.id} total={d.count || 1} copy={copy} />
    </div>
  );
}

export default function AdhkarFlow({ items, language, audio, copy, audioCopy, demonstratorId, friendId, stageNo, reward }) {
  const t = copy.adhkar;
  const [time, setTime] = useState(null);

  const list = useMemo(
    () => items.filter((i) => i.kind === 'dhikr' && (!time || i.data.when === 'both' || i.data.when === time)),
    [items, time]
  );

  if (!items.some((i) => i.kind === 'dhikr')) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#4b5a6a' }}>{t.empty}</p>
      </div>
    );
  }

  if (!time) return <TimeChooser copy={t} onPick={setTime} />;

  const steps = list.map((it, i) => ({
    key: it.id,
    node: <DhikrCard item={it} index={i} total={list.length} language={language} audio={audio} copy={t} audioCopy={audioCopy} />,
  }));
  steps.push({
    key: 'reward',
    node: (
      <RewardStep
        demonstratorId={demonstratorId}
        friendId={friendId}
        copy={copy}
        stickerLabel={copy.stageSticker.replace('{n}', stageNo)}
        completed={reward.completed}
        submitting={reward.submitting}
        error={reward.error}
        onFinish={reward.onFinish}
        cheering={reward.cheering}
      />
    ),
  });

  return (
    <div>
      <p style={{ textAlign: 'center', margin: '0 0 8px' }}>
        <button
          type="button"
          onClick={() => setTime(null)}
          style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
        >
          {time === 'morning' ? t.morning : t.evening}
        </button>
      </p>
      <LessonStepper key={`adhkar-${time}`} steps={steps} />
    </div>
  );
}
