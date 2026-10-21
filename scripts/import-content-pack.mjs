// Imports arabikids-content-pack-draft.md into content_items (+ audio_assets
// manifest rows) as `draft`. The Arabic is copied verbatim from the pack and
// never edited, re-vocalised or "fixed" - if something looks wrong the item
// gets a review note instead.
//
//   node scripts/import-content-pack.mjs <path-to-pack.md> [--dry-run]
//
// Safe to re-run: existing rows get their `data` refreshed but their
// review_status / review_note are never touched, so approvals survive a
// re-import. Requires supabase/add_interactive_upgrade.sql to have run.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  firstWord, chantText, sentencePattern, idNumber, vowelForms, VOWELS_FROM_LETTER,
} from '../frontend/src/lib/contentHelpers.js';
import { arabicFromRaw, kidText } from '../frontend/src/lib/contentHelpers.js';
import { translations } from '../frontend/src/lib/i18n/translations.js';
import { CHARACTERS } from '../frontend/src/lib/characters.config.js';

// How many letters are free (Stage-1-style "try before you buy"). The pack
// doesn't say; this is the one place to change it. Jimmy to confirm.
export const FREE_LETTER_COUNT = 6;

// Pack-level ⚠ notes that sit under tables instead of inside a row.
const PACK_NOTES = {
  L22: 'Pack ⚠: dog (كَلْب) can be a sensitive topic in some Muslim homes. Option: swap to كَتْكُوت (chick) or كَنْغَر (kangaroo). Jimmy decides.',
  P22: 'Pack ⚠: swap along with L22 if dog is replaced.',
  L01: 'Pack ⚠: Alif shown as ا (shape) and أ in the word (hamza on alif). Reviewer: confirm the teaching wording.',
  P01: 'Pack ⚠: ا has no true "beginning" form; أ stands in.',
};
const STRONG_AUDIO_REVIEW = ['L04', 'L06', 'L07', 'L09', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L21'];

function slug(header) {
  const h = header.trim();
  if (/[؀-ۿ]/.test(h)) return 'hadha_hadhihi'; // the هٰذَا/هٰذِهِ column
  return h
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9#]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

const isTableSep = (l) => /^\|[\s:|-]+\|$/.test((l || '').trim());

export function parseTables(md) {
  const lines = md.split(/\r?\n/);
  const tables = [];
  let heading = '';
  let bold = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{2,3}\s/.test(line)) {
      heading = line.replace(/^#+\s*/, '').trim();
      bold = '';
      continue;
    }
    const b = /^\*\*(.+?)\*\*/.exec(line);
    if (b && !line.trim().startsWith('|')) bold = b[1].trim();

    if (line.trim().startsWith('|') && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        rows.push(splitRow(lines[j]));
        j += 1;
      }
      tables.push({ heading, bold, header, rows });
      i = j - 1;
    }
  }
  return { tables, lines };
}

function parseIntention(lines) {
  const start = lines.findIndex((l) => /^###\s*4\.3/.test(l));
  if (start === -1) return null;
  const block = [];
  for (let i = start + 1; i < lines.length && !/^#{2,3}\s/.test(lines[i]) && !/^---/.test(lines[i]); i += 1) {
    if (lines[i].trim()) block.push(lines[i].trim());
  }
  const arabic = block.find((l) => !l.startsWith('-') && !l.startsWith('⚠'));
  const en = block.find((l) => l.startsWith('- EN:'))?.replace('- EN:', '').trim();
  const ms = block.find((l) => l.startsWith('- MS:'))?.replace('- MS:', '').trim();
  if (!arabic) return null;
  return { id: 'WD-INT', data: { arabic, en, ms }, label: 'Intention' };
}

const SURAH_KEYS = { 'Al-Fatihah': 'FAT', 'Al-Ikhlas': 'IKH', 'Al-Kawthar': 'KAW', 'An-Nas': 'NAS' };

function surahKeyFrom(bold) {
  for (const [name, key] of Object.entries(SURAH_KEYS)) if (bold.startsWith(name)) return { key, name };
  return null;
}

function kindFor(heading) {
  if (/^1\./.test(heading)) return 'letter';
  if (/^2\./.test(heading)) return 'position';
  if (/^3\.1/.test(heading)) return 'host_line_hudi';
  if (/^3\.2/.test(heading)) return 'host_line_practical';
  if (/^3\.3/.test(heading)) return 'reaction';
  if (/^4\.1/.test(heading)) return 'wudu_lesson';
  if (/^4\.2/.test(heading)) return 'wudu_step';
  if (/^4\.4/.test(heading)) return 'wudu_dua';
  if (/^4\.5/.test(heading)) return 'wudu_breaker';
  if (/^5\.1/.test(heading)) return 'prayer_time';
  if (/^5\.2/.test(heading)) return 'movement';
  if (/^5\.3/.test(heading)) return 'phrase';
  if (/^5\.4/.test(heading)) return 'surah_verse';
  if (/^5\.5/.test(heading)) return 'prayer_order';
  if (/^6\./.test(heading)) return 'dua';
  if (/^7\./.test(heading)) return 'dhikr';
  if (/^Eating manners/i.test(heading)) return 'manner';
  return null;
}

const STAGE_BY_KIND = {
  dhikr: 10,
  wudu_lesson: 1, wudu_step: 1, wudu_dua: 1, wudu_breaker: 1, wudu_intention: 1,
  prayer_time: 2, movement: 3, phrase: 4, surah_verse: 4, prayer_order: 5, manner: 7,
};

export function parseContentPack(md) {
  const { tables, lines } = parseTables(md);
  const items = [];
  const counters = {};

  for (const table of tables) {
    const kind = kindFor(table.heading);
    if (!kind) continue;
    const keys = table.header.map(slug);

    for (const cells of table.rows) {
      const data = {};
      keys.forEach((k, idx) => { data[k] = cells[idx] ?? ''; });

      let id = data.id;
      let label = '';
      if (kind === 'surah_verse') {
        const s = surahKeyFrom(table.bold);
        if (!s) continue;
        id = `${s.key}-${data['#']}`;
        data.surah = s.name;
        label = `${s.name} ${data['#']}`;
      } else if (kind === 'prayer_order') {
        id = `PO-${data.step}`;
        label = `Step ${data.step}`;
      }
      if (!id) continue;

      if (kind === 'letter') label = data.letter;
      else if (kind === 'position') label = data.letter;
      else if (kind === 'wudu_step') label = data.step;
      else if (kind === 'wudu_lesson') label = data.lesson;
      else if (kind === 'prayer_time') label = data.prayer;
      else if (kind === 'movement') label = data.movement;
      else if (kind === 'phrase') label = data.moment;
      else if (kind === 'dua') label = data.situation;
      else if (kind === 'dhikr') {
        // `raw` is the verbatim source text; `arabic` is only sliced out of it.
        data.arabic = arabicFromRaw(data.raw);
        data.count = Number(data.count) || 1;
        data.when = data.when || 'both';
        label = id;
      }
      else if (kind === 'reaction') label = data.moment;
      else if (kind === 'wudu_dua') label = 'Dua after wudu';
      else if (kind === 'wudu_breaker') label = id;
      else if (!label) label = id;

      counters[kind] = (counters[kind] ?? 0) + 1;

      let stageNo = STAGE_BY_KIND[kind] ?? null;
      if (kind === 'dua') stageNo = Number(data.stage) || null;

      let isFree = false;
      if (kind === 'letter' || kind === 'position') isFree = idNumber(id) <= FREE_LETTER_COUNT;
      else if (kind.startsWith('host_line') || kind === 'reaction') isFree = true;
      else if (stageNo === 1) isFree = true;

      const flagged = cells.filter((c) => c.includes('⚠'));
      let reviewNote = PACK_NOTES[id] ?? null;
      if (!reviewNote && flagged.length) reviewNote = `Pack ⚠: ${flagged.join(' / ')}`;
      if (!reviewNote && STRONG_AUDIO_REVIEW.includes(id)) reviewNote = 'Pack: needs the strongest audio review (sound not in English/Malay).';

      items.push({
        id,
        kind: kind.startsWith('host_line') ? 'host_line' : kind,
        stage_no: stageNo,
        order_index: counters[kind],
        is_free: isFree,
        label: label || id,
        sublabel: kind === 'letter' ? data.name_say : null,
        data: kind.startsWith('host_line') ? { ...data, character: kind === 'host_line_hudi' ? 'hudi' : 'practical' } : data,
        review_status: 'draft',
        review_note: reviewNote,
      });
    }
  }

  const intention = parseIntention(lines);
  if (intention) {
    items.push({
      ...intention,
      kind: 'wudu_intention',
      stage_no: 1,
      order_index: 1,
      is_free: true,
      review_status: 'draft',
      review_note: 'Pack ⚠: optional (as used in Malaysia). Reviewer to confirm.',
    });
  }

  // Reviewed Arabic wording + Malay titles for the pack's English/Malay-only text.
  const overlayFile = fileURLToPath(new URL('../content/i18n-overlay.json', import.meta.url));
  if (existsSync(overlayFile)) {
    const overlay = JSON.parse(readFileSync(overlayFile, 'utf8'));
    for (const it of items) if (overlay[it.id]) it.data.i18n = overlay[it.id];
  }
  return items;
}

// Clip list a generation batch (VoiceStudio / licensed recordings) works from.
export function buildAudioManifest(items) {
  const clips = [];
  const add = (id, contentRef, language, sourceType, scriptText, licenseNote) => {
    if (!scriptText) return;
    clips.push({
      id,
      content_ref: contentRef,
      language,
      source_type: sourceType,
      script_text: kidText(scriptText),
      status: 'pending',
      license_note: licenseNote ?? null,
    });
  };

  for (const it of items) {
    const d = it.data;
    switch (it.kind) {
      case 'letter':
        add(`${it.id}.name.ar`, it.id, 'ar', 'voicestudio', d.name_ar);
        add(`${it.id}.word.ar`, it.id, 'ar', 'voicestudio', firstWord(d.main_word));
        add(`${it.id}.chant.en`, it.id, 'en', 'voicestudio', chantText(d, 'en'));
        add(`${it.id}.chant.ms`, it.id, 'ms', 'voicestudio', chantText(d, 'ms'));
        add(`${it.id}.chant.ar`, it.id, 'ar', 'voicestudio', chantText(d, 'ar'));
        add(`${it.id}.sentence.ar`, it.id, 'ar', 'voicestudio', sentencePattern(d));
        if (idNumber(it.id) >= VOWELS_FROM_LETTER) {
          for (const v of vowelForms(d.letter, d.sound_with_fatha)) {
            add(`${it.id}.${v.key}.ar`, it.id, 'ar', 'voicestudio', v.arabic);
          }
        }
        break;
      case 'position':
        add(`${it.id}.beg.ar`, it.id, 'ar', 'voicestudio', firstWord(d.beginning));
        add(`${it.id}.mid.ar`, it.id, 'ar', 'voicestudio', firstWord(d.middle));
        add(`${it.id}.end.ar`, it.id, 'ar', 'voicestudio', firstWord(d.end));
        break;
      case 'reaction':
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.english);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.malay);
        if (d.arabic_optional && d.arabic_optional !== '—') add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.arabic_optional);
        else add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.i18n?.ar?.text);
        break;
      case 'wudu_lesson':
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.kid_friendly_text_en);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.teks_ms);
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.i18n?.ar?.text);
        break;
      case 'wudu_step':
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.kid_text_en);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.teks_ms);
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.i18n?.ar?.text);
        break;
      case 'dhikr':
        // Qur'an inside an adhkar row plays the reciter audio / the owner's own recording.
        if (d.raw?.includes('﴿')) add(`${it.id}.ar`, it.id, 'ar', 'licensed', d.arabic, "Contains Qur'an: reciter audio or the owner's own recording");
        else add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.arabic);
        break;
      case 'wudu_dua':
      case 'dua':
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.arabic);
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.en);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.ms);
        break;
      case 'wudu_intention':
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.arabic);
        break;
      case 'movement':
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.kid_text_en);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.teks_ms);
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.i18n?.ar?.text);
        break;
      case 'phrase':
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.arabic);
        break;
      case 'surah_verse':
        // Qur'anic: licensed reciter audio only (written permission needed first).
        add(`${it.id}.ar`, it.id, 'ar', 'licensed', d.arabic, 'Quran Foundation / Quran.com audio - written permission for offline/commercial use required first');
        break;
      case 'manner':
        add(`${it.id}.en`, it.id, 'en', 'voicestudio', d.en);
        add(`${it.id}.ms`, it.id, 'ms', 'voicestudio', d.ms);
        add(`${it.id}.ar`, it.id, 'ar', 'voicestudio', d.i18n?.ar?.text);
        break;
      default:
        break;
    }
  }
  // Intro clips: character opener lines expanded per letter / stage topic.
  // Ids match the audioIdFor() callbacks in LetterLoop / WuduFlow / DuaFlow /
  // BrowseFlow.
  const fill = (text, vars) => Object.entries(vars).reduce((a, [k, v]) => a.replaceAll(`{${k}}`, v), text);
  const hudiLines = items.filter((i) => i.kind === 'host_line' && i.data.character === 'hudi');
  const practicalLines = items.filter((i) => i.kind === 'host_line' && i.data.character === 'practical');
  const letters = items.filter((i) => i.kind === 'letter');
  for (const line of hudiLines) {
    for (const l of letters) {
      for (const lang of ['en', 'ms', 'ar']) {
        const src = lang === 'ar' ? line.data.i18n?.ar?.text : lang === 'ms' ? line.data.malay : line.data.english;
        const name = lang === 'ar' ? l.data.name_ar : l.data.name_say;
        add(`intro.${line.id}.${l.id}.${lang}`, line.id, lang, 'voicestudio', src && fill(src, { letter: name, topic: name }));
      }
    }
  }
  const P = translations;
  const topics = [{ key: 'wudu', en: P.en.interactive.practical.wuduTopic, ms: P.ms.interactive.practical.wuduTopic, ar: P.ar.interactive.practical.wuduTopic }];
  for (let n = 2; n <= 9; n += 1) {
    topics.push({ key: `stage${n}`, en: P.en.interactive.practical.stageNames[n], ms: P.ms.interactive.practical.stageNames[n], ar: P.ar.interactive.practical.stageNames[n] });
  }
  const AR_NAMES = { amir: 'أَمِير', nur: 'نُور' }; // the characters' names, spelled for Arabic narration
  for (const line of practicalLines) {
    for (const t of topics) {
      for (const demo of ['amir', 'nur']) {
        for (const lang of ['en', 'ms', 'ar']) {
          const src = lang === 'ar' ? line.data.i18n?.ar?.text : lang === 'ms' ? line.data.malay : line.data.english;
          const name = lang === 'ar' ? AR_NAMES[demo] : CHARACTERS[demo].name;
          add(`intro.${line.id}.${t.key}.${demo}.${lang}`, line.id, lang, 'voicestudio', src && fill(src, { name, topic: t[lang] }));
        }
      }
    }
  }
  return clips;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const files = args.filter((a) => !a.startsWith('--'));
  const file = files[0];
  if (!file) {
    console.error('Usage: node scripts/import-content-pack.mjs <path-to-pack.md> [--dry-run]');
    process.exit(1);
  }

  const items = parseContentPack(files.map((f) => readFileSync(f, 'utf8')).join('\n\n'));
  const clips = buildAudioManifest(items);

  const byKind = {};
  for (const it of items) byKind[it.kind] = (byKind[it.kind] ?? 0) + 1;
  console.log('Parsed content items by kind:', byKind);
  console.log(`Total items: ${items.length}, audio manifest clips: ${clips.length}`);

  if (dryRun) {
    const keysByKind = {};
    for (const it of items) keysByKind[it.kind] = Object.keys(it.data).join(', ');
    console.log('Data keys by kind:');
    for (const [k, v] of Object.entries(keysByKind)) console.log(`  ${k}: ${v}`);
    console.log('(dry run - nothing written)');
    return;
  }

  config();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: existingItems, error: e1 } = await supabase.from('content_items').select('id');
  if (e1) throw e1;
  const existingIds = new Set(existingItems.map((r) => r.id));

  const fresh = items.filter((i) => !existingIds.has(i.id));
  const known = items
    .filter((i) => existingIds.has(i.id))
    .map(({ review_status, review_note, ...rest }) => rest); // never overwrite review state

  if (fresh.length) {
    const { error } = await supabase.from('content_items').insert(fresh);
    if (error) throw error;
  }
  if (known.length) {
    const { error } = await supabase.from('content_items').upsert(known);
    if (error) throw error;
  }
  console.log(`content_items: ${fresh.length} new (draft), ${known.length} refreshed (review state untouched)`);

  const { data: existingClips, error: e2 } = await supabase.from('audio_assets').select('id');
  if (e2) throw e2;
  const clipIds = new Set(existingClips.map((r) => r.id));
  const freshClips = clips.filter((c) => !clipIds.has(c.id));
  const knownClips = clips
    .filter((c) => clipIds.has(c.id))
    .map(({ status, license_note, ...rest }) => rest); // keep status/licence as reviewed
  if (freshClips.length) {
    const { error } = await supabase.from('audio_assets').insert(freshClips);
    if (error) throw error;
  }
  if (knownClips.length) {
    const { error } = await supabase.from('audio_assets').upsert(knownClips);
    if (error) throw error;
  }
  console.log(`audio_assets: ${freshClips.length} new (pending), ${knownClips.length} refreshed`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
