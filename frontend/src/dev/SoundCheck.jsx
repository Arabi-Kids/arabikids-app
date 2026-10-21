import { useEffect, useMemo, useState } from 'react';
import fixture from './contentFixture.json';
import { chantText, firstWord, plain } from '../lib/contentHelpers.js';
import { speakInLanguage, listVoiceNames } from '../lib/speech.js';

// DEV ONLY - one or two sentences per stage so you can hear how each language
// sounds on THIS device. Uses the device's built-in voices (the real generated
// voices do not exist yet), speaking each text in its own language.
const byId = Object.fromEntries(fixture.items.map((i) => [i.id, i]));

function rowsFor() {
  const g = (id) => byId[id]?.data ?? {};
  const rows = [];
  const add = (stage, label, texts) => rows.push({ stage, label, texts: texts.filter((t) => t.text) });

  const l2 = g('L02');
  add('Letters', 'Letter Ba: name and word', [
    { lang: 'ar', text: l2.name_ar },
    { lang: 'ar', text: firstWord(l2.main_word) },
  ]);
  add('Letters', 'Letter Ba: chant (English and Malay)', [
    { lang: 'en', text: l2.name_say ? chantText(l2, 'en') : '' },
    { lang: 'ms', text: l2.name_say ? chantText(l2, 'ms') : '' },
  ]);

  const rowFrom = (stage, id, enKey, msKey, arKey) =>
    add(stage, id, [
      { lang: 'ar', text: arKey ? g(id)[arKey] : '' },
      { lang: 'en', text: plain(g(id)[enKey]) },
      { lang: 'ms', text: plain(g(id)[msKey]) },
    ]);

  rowFrom('Stage 1: Wudu', 'WD-L1', 'kid_friendly_text_en', 'teks_ms');
  rowFrom('Stage 1: Wudu', 'WD-DU2', 'en', 'ms', 'arabic');
  rowFrom('Stage 2: Prayer basics', 'PR-01', 'when_en', 'bila_ms');
  rowFrom('Stage 3: Movements', 'MV-03', 'kid_text_en', 'teks_ms', 'arabic');
  rowFrom('Stage 4: What we say', 'SY-03', 'en', 'ms', 'arabic');
  rowFrom('Stage 4: What we say', 'SY-04', 'en', 'ms', 'arabic');
  add('Stage 5: Full prayer', 'PO-1', [{ lang: 'en', text: plain(g('PO-1').content) }]);
  rowFrom('Stage 6: Duas, home', 'DU-01', 'en', 'ms', 'arabic');
  rowFrom('Stage 6: Duas, home', 'DU-02', 'en', 'ms', 'arabic');
  rowFrom('Stage 7: Duas, food', 'DU-05', 'en', 'ms', 'arabic');
  rowFrom('Stage 7: Duas, food', 'DU-07', 'en', 'ms', 'arabic');
  rowFrom('Stage 8: Duas, sleep', 'DU-08', 'en', 'ms', 'arabic');
  rowFrom('Stage 8: Duas, sleep', 'DU-09', 'en', 'ms', 'arabic');
  rowFrom('Stage 9: Duas, going out', 'DU-11', 'en', 'ms', 'arabic');
  rowFrom('Stage 9: Duas, going out', 'DU-12', 'en', 'ms', 'arabic');
  return rows;
}

const LANG_NAME = { ar: 'Arabic', en: 'English', ms: 'Malay' };

export default function SoundCheck() {
  const rows = useMemo(rowsFor, []);
  const [voices, setVoices] = useState({ ar: [], en: [], ms: [] });
  const [last, setLast] = useState('');

  useEffect(() => {
    const read = () => setVoices({ ar: listVoiceNames('ar'), en: listVoiceNames('en'), ms: listVoiceNames('ms') });
    read();
    window.speechSynthesis?.addEventListener?.('voiceschanged', read);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', read);
  }, []);

  function play(lang, text) {
    const found = speakInLanguage(text, lang, { rate: 0.8 });
    setLast(
      found
        ? `Played in ${LANG_NAME[lang]} with a ${LANG_NAME[lang]} voice.`
        : `This device has NO ${LANG_NAME[lang]} voice installed, so the browser used its default voice and it will sound wrong. The final generated audio does not depend on this.`
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <a href="/dev" style={{ color: '#1B4F8A', fontWeight: 800 }}>← Preview start page</a>
      <h1 style={{ color: '#1B4F8A', marginBottom: 4 }}>Sound check</h1>
      <p style={{ color: '#4b5a6a', marginTop: 0 }}>
        These play with the voices built into this computer or browser, not with the final generated voices.
        Each button speaks its text in that text's own language (Arabic, English or Malay).
      </p>

      <div style={{ border: '2px solid #1B4F8A', borderRadius: 14, padding: 14, background: '#fff', marginBottom: 18 }}>
        <strong>Voices installed on this device</strong>
        {['ar', 'en', 'ms'].map((l) => (
          <p key={l} style={{ margin: '6px 0', color: voices[l].length ? '#1a7a4a' : '#b3261e' }}>
            <b>{LANG_NAME[l]}:</b> {voices[l].length ? voices[l].slice(0, 3).join(', ') : 'none installed'}
          </p>
        ))}
      </div>

      {last && <p style={{ background: '#fff7e0', padding: 10, borderRadius: 10, fontWeight: 700 }}>{last}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r) => (
          <div key={`${r.stage}-${r.label}`} style={{ background: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 2px 8px #0001' }}>
            <div style={{ fontSize: '0.8rem', color: '#8394a3', fontWeight: 800 }}>{r.stage} · {r.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {r.texts.map((t) => (
                <div key={t.lang + t.text} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => play(t.lang, t.text)}
                    style={{ flexShrink: 0, minWidth: 96, padding: '8px 12px', borderRadius: 10, border: 'none', background: '#1B4F8A', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ▶ {LANG_NAME[t.lang]}
                  </button>
                  <span
                    dir={t.lang === 'ar' ? 'rtl' : 'ltr'}
                    style={{ fontFamily: t.lang === 'ar' ? 'Amiri, serif' : undefined, fontSize: t.lang === 'ar' ? '1.4rem' : '0.95rem', flex: 1 }}
                  >
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
