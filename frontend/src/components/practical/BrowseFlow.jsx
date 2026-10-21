import { useState } from 'react';
import CharacterIntro from '../characters/CharacterIntro.jsx';
import LessonStepper from '../LessonStepper.jsx';
import RewardStep from './RewardStep.jsx';
import { ArabicHearCard, AudioStatus } from './shared.jsx';
import { localized, plain, kidText, titleOf, meaningOf } from '../../lib/contentHelpers.js';
import { playTap } from '../../lib/sounds.js';
import { playReciterAudio, verseRefFor } from '../../lib/quranAudio.js';
import { CHARACTERS, characterName } from '../../lib/characters.config.js';

/** Stages 2-5 render whatever has been approved so far, in the pack's own
 * order. Stage-specific interactive games land as that content is approved
 * (build order step 5). */
export default function BrowseFlow({ stageNo, items, hostLines, demonstratorId, friendId, language, audio, seen, copy, audioCopy, reward }) {
  const [introDone, setIntroDone] = useState(false);
  const demo = CHARACTERS[demonstratorId];
  const lang = ['ms', 'ar'].includes(language) ? language : 'en';
  const meaning = (d) => meaningOf(d, language);

  const hear = (id, text) => {
    playTap();
    audio.unlock();
    audio.play(id, { fallbackText: text });
  };

  // Qur'an verses: a recording uploaded for this exact verse (approved in
  // Audio Review) wins; otherwise the platform's existing reciter audio (the
  // same Mishary Alafasy source the Qur'an pillar already streams) plays.
  const hearVerse = (v) => {
    playTap();
    audio.unlock();
    const id = `${v.id}.ar`;
    if (audio.has(id)) {
      audio.play(id, { fallbackText: v.data.arabic });
      return;
    }
    const ref = verseRefFor(v);
    if (!ref || !playReciterAudio(ref, { onError: () => audio.play(id, { fallbackText: v.data.arabic }) })) {
      audio.play(id, { fallbackText: v.data.arabic });
    }
  };

  const byKind = (k) => items.filter((i) => i.kind === k);
  const introLines = hostLines.map((l) => ({ id: l.id, text: localized(l, language) }));
  const list = [];

  if (introLines.length) {
    list.push({
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

  const times = byKind('prayer_time');
  if (times.length) {
    list.push({
      key: 'times',
      node: (
        <div className="card">
          <span className="badge badge-gold">{copy.prayerTimes}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {times.map((p) => (
              <div key={p.id} style={{ padding: '12px 14px', borderRadius: 14, border: '2px solid var(--color-blue)', background: 'rgba(27,79,138,0.05)' }}>
                <p style={{ margin: 0, fontWeight: 800 }}>
                  <span dir="auto">{titleOf(p, language)}</span>
                  <span className="badge badge-gold" style={{ marginInlineStart: 8 }}>{copy.rakat.replace('{n}', p.data.rakat)}</span>
                </p>
                <p style={{ margin: '4px 0 0', color: '#4b5a6a' }}>{localized(p, language)}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  const moves = byKind('movement');
  if (moves.length) {
    list.push({
      key: 'moves',
      node: (
        <div className="card">
          <span className="badge badge-teal">{copy.movements}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {moves.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => hear(`${m.id}.${lang}`, localized(m, language))}
                style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 14, border: '2px solid var(--color-teal)', background: 'rgba(26,158,138,0.07)', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontWeight: 900, color: 'var(--color-teal-dark)' }}>{i + 1}</span>
                <span style={{ flex: 1 }}>
                  <span className="arabic-text" dir="rtl" style={{ display: 'block', fontSize: '1.2rem' }}>{m.data.arabic}</span>
                  <span style={{ fontWeight: 700 }}>{localized(m, language)}</span>
                </span>
              </button>
            ))}
          </div>
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  const phrases = byKind('phrase');
  if (phrases.length) {
    list.push({
      key: 'phrases',
      node: (
        <div className="card">
          <span className="badge badge-gold">{copy.whatWeSay}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {phrases.map((p) => (
              <ArabicHearCard
                key={p.id}
                caption={titleOf(p, language)}
                arabic={p.data.arabic}
                meaning={meaning(p.data)}
                hint={copy.tapToHear}
                onHear={() => hear(`${p.id}.ar`, p.data.arabic)}
              />
            ))}
          </div>
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  const verses = byKind('surah_verse');
  if (verses.length) {
    const bySurah = verses.reduce((acc, v) => {
      (acc[v.data.surah] ||= []).push(v);
      return acc;
    }, {});
    Object.entries(bySurah).forEach(([surah, vs]) => {
      list.push({
        key: `surah-${surah}`,
        node: (
          <div className="card">
            <span className="badge badge-purple">{surah}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {vs.map((v) => (
                <ArabicHearCard
                  key={v.id}
                  caption={`${v.data['#']}`}
                  arabic={v.data.arabic}
                  meaning={meaning(v.data)}
                  hint={copy.tapToHear}
                  onHear={() => hearVerse(v)}
                />
              ))}
            </div>
            <AudioStatus status={audio.status} copy={audioCopy} />
          </div>
        ),
      });
    });
  }

  const order = byKind('prayer_order');
  if (order.length) {
    list.push({
      key: 'order',
      node: (
        <div className="card">
          <span className="badge badge-orange">{copy.oneRakah}</span>
          <ol style={{ margin: '14px 0 0', paddingInlineStart: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.map((o) => (
              <li key={o.id} style={{ fontWeight: 700 }}>{o.data.i18n?.[language]?.text ?? kidText(plain(o.data.content))}</li>
            ))}
          </ol>
        </div>
      ),
    });
  }

  if (list.length === (introLines.length ? 1 : 0)) {
    list.push({
      key: 'empty',
      node: (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#4b5a6a' }}>{copy.stageNotReady}</p>
        </div>
      ),
    });
  }

  list.push({
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

  return <LessonStepper key={`browse-${stageNo}`} steps={list} />;
}
