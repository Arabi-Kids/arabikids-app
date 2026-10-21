import { useState } from 'react';
import CharacterIntro from '../characters/CharacterIntro.jsx';
import LessonStepper from '../LessonStepper.jsx';
import TapToWash from './TapToWash.jsx';
import OrderPuzzle from './OrderPuzzle.jsx';
import RewardStep from './RewardStep.jsx';
import { ArabicHearCard, AudioStatus, WuduIcon } from './shared.jsx';
import { localized, plain, minAgeFromBand, titleOf, meaningOf } from '../../lib/contentHelpers.js';
import { playTap } from '../../lib/sounds.js';
import { CHARACTERS, characterName } from '../../lib/characters.config.js';

// Fard/sunnah labels are shown from this age (pack: "reviewer to confirm").
const LABEL_MIN_AGE = 8;

function TextCard({ badge, tone = 'free', text, onHear, audio, audioCopy, hearLabel, children }) {
  return (
    <div className="card" style={{ background: 'var(--color-sky)', boxShadow: 'none', textAlign: 'center' }}>
      <span className={`badge badge-${tone}`}>{badge}</span>
      <p style={{ fontSize: '1.15rem', fontWeight: 700, margin: '14px 0' }}>{text}</p>
      {onHear && (
        <button type="button" className="btn btn-secondary btn-chunky" onClick={onHear}>
          {hearLabel}
        </button>
      )}
      <AudioStatus status={audio?.status} copy={audioCopy} />
      {children}
    </div>
  );
}

export default function WuduFlow({
  items,
  hostLines,
  demonstratorId,
  friendId,
  language,
  audio,
  ageYears,
  seen,
  copy,
  audioCopy,
  reward,
}) {
  const [introDone, setIntroDone] = useState(false);
  const byKind = (kind) => items.filter((i) => i.kind === kind);
  const lessons = Object.fromEntries(byKind('wudu_lesson').map((l) => [l.id, l]));
  const steps = byKind('wudu_step');
  const duas = byKind('wudu_dua');
  const breakers = byKind('wudu_breaker').filter((b) => (ageYears ?? 0) >= minAgeFromBand(b.data.age_band));
  const intention = byKind('wudu_intention')[0];
  const demo = CHARACTERS[demonstratorId];
  const lang = ['ms', 'ar'].includes(language) ? language : 'en';
  const showLabels = (ageYears ?? 0) >= LABEL_MIN_AGE;

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
            vars={{ name: characterName(demonstratorId, language), topic: copy.wuduTopic }}
            seen={seen}
            audioIdFor={(line) => `intro.${line.id}.wudu.${demonstratorId}.${lang}`}
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

  if (lessons['WD-L1']) {
    const l = lessons['WD-L1'];
    stepList.push({
      key: 'why',
      node: (
        <TextCard
          badge={copy.wuduWhy}
          text={localized(l, language)}
          onHear={() => hear(`${l.id}.${lang}`, localized(l, language))}
          hearLabel={copy.hear}
          audio={audio}
          audioCopy={audioCopy}
        />
      ),
    });
  }

  if (steps.length) {
    stepList.push({
      key: 'steps',
      node: (
        <div className="card">
          <span className="badge badge-gold">{copy.wuduSteps}</span>
          {lessons['WD-L2'] && !/WD-\d/.test(localized(lessons['WD-L2'], language)) && (
            <p style={{ margin: '10px 0 14px', color: '#4b5a6a' }}>{localized(lessons['WD-L2'], language)}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => hear(`${s.id}.${lang}`, localized(s, language))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 14,
                  border: '2px solid var(--color-blue)',
                  background: 'rgba(27,79,138,0.05)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 900, color: 'var(--color-blue)', minWidth: 22 }}>{i + 1}</span>
                <WuduIcon id={s.id} size={38} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 800 }}>{titleOf(s, language)}</span>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#4b5a6a' }}>{localized(s, language)}</span>
                  {showLabels && s.data.shafii_status && (
                    <span className="badge badge-teal" style={{ marginTop: 6, display: 'inline-block' }}>
                      {plain(s.data.shafii_status)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
          {intention && (
            <div style={{ marginTop: 16 }}>
              <ArabicHearCard
                tone="gold"
                caption={copy.intentionOptional}
                arabic={intention.data.arabic}
                meaning={meaningOf(intention.data, language)}
                hint={copy.tapToHear}
                onHear={() => hear(`${intention.id}.ar`, intention.data.arabic)}
              />
            </div>
          )}
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  const washParts = steps.filter((s) => !['WD-01', 'WD-10'].includes(s.id));
  if (washParts.length >= 2) {
    stepList.push({
      key: 'wash',
      node: (
        <div className="card">
          <span className="badge badge-teal">{copy.washBadge}</span>
          {lessons['WD-L3'] && <p style={{ margin: '10px 0 14px', color: '#4b5a6a' }}>{localized(lessons['WD-L3'], language)}</p>}
          <TapToWash parts={washParts} demonstratorId={demonstratorId} language={language} copy={copy} />
        </div>
      ),
    });
  }

  if (steps.length >= 3) {
    stepList.push({
      key: 'order',
      node: (
        <div className="card">
          <span className="badge badge-purple">{copy.orderBadge}</span>
          <div style={{ marginTop: 12 }}>
            <OrderPuzzle items={steps} language={language} copy={copy} />
          </div>
        </div>
      ),
    });
  }

  if (duas.length) {
    stepList.push({
      key: 'dua',
      node: (
        <div className="card">
          <span className="badge badge-gold">{copy.duaAfterWudu}</span>
          {lessons['WD-L4'] && <p style={{ margin: '10px 0 14px', color: '#4b5a6a' }}>{localized(lessons['WD-L4'], language)}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {duas.map((d) => (
              <ArabicHearCard
                key={d.id}
                tone="gold"
                arabic={d.data.arabic}
                meaning={meaningOf(d.data, language)}
                hint={copy.tapToHear}
                onHear={() => hear(`${d.id}.ar`, d.data.arabic)}
              />
            ))}
          </div>
          <AudioStatus status={audio.status} copy={audioCopy} />
        </div>
      ),
    });
  }

  if (lessons['WD-L5'] || breakers.length) {
    stepList.push({
      key: 'breaks',
      node: (
        <div className="card">
          <span className="badge badge-orange">{copy.wuduBreaks}</span>
          {lessons['WD-L5'] && <p style={{ margin: '10px 0 14px', color: '#4b5a6a' }}>{localized(lessons['WD-L5'], language)}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {breakers.map((b) => (
              <div key={b.id} style={{ padding: '12px 14px', borderRadius: 14, border: '2px solid var(--color-orange)', background: 'rgba(232,130,60,0.08)' }}>
                {localized(b, language)}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  stepList.push({
    key: 'reward',
    node: (
      <div>
        <RewardStep
          demonstratorId={demonstratorId}
          friendId={friendId}
          copy={copy}
          stickerLabel={copy.wuduSticker}
          completed={reward.completed}
          submitting={reward.submitting}
          error={reward.error}
          onFinish={reward.onFinish}
          cheering={reward.cheering}
        />
      </div>
    ),
  });

  return <LessonStepper key="wudu" steps={stepList} />;
}
