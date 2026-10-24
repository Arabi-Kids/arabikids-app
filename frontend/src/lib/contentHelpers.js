// Pure helpers shared by the UI and scripts/import-content-pack.mjs. No Arabic
// text is authored or altered here - only sliced out of / joined from strings
// that came from the reviewed content pack.

/** Removes markdown bold markers left in pack cells (e.g. "**Fard**"). */
export function plain(value) {
  return typeof value === 'string' ? value.replace(/\*\*/g, '').trim() : value;
}

/** "أَسَد (also أَرْنَب)" -> "أَسَد". The part before the first " (" - used where a
 * single speakable word is needed. Slices only; never edits characters. */
export function firstWord(cell) {
  if (!cell) return '';
  const idx = cell.indexOf(' (');
  return (idx === -1 ? cell : cell.slice(0, idx)).trim();
}

function cap(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

/** "asad (arnab)" -> ["Asad", "Arnab"]; "battah" -> ["Battah"]. */
export function titleWords(sayIt) {
  if (!sayIt) return [];
  const m = /^(.+?)\s*\((.+)\)\s*$/.exec(sayIt.trim());
  return (m ? [m[1], m[2]] : [sayIt.trim()]).map(cap);
}

/** "lion (rabbit)" -> ["lion", "rabbit"]; "duck" -> ["duck"]. */
function pairOf(cell) {
  const m = /^(.+?)\s*\((.+)\)\s*$/.exec((cell || '').trim());
  return m ? [m[1].trim(), m[2].trim()] : [(cell || '').trim()];
}

/** Chant: "{Name} for {word}, {meaning}! {Name} for {word}, {meaning}!
 * {sound}, {sound}, {sound}!" The pack's template with the picture's word
 * said out loud as well (EN) or "untuk" (MS). Alif is the only letter with two
 * words and uses both. */
export function chantText(letter, language = 'en') {
  if (language === 'ar') {
    // Arabic chant, assembled only from the pack's Arabic: letter name, picture
    // word(s), then the letter with fatha three times.
    const words = arabicWords(letter.main_word);
    const sound = vowelForms(letter.letter, letter.sound_with_fatha)[0].arabic;
    const line = (i) => `${letter.name_ar}، ${words[i] ?? words[0]}!`;
    return `${line(0)} ${line(words.length === 2 ? 1 : 0)} ${sound}، ${sound}، ${sound}!`;
  }
  const name = letter.name_say;
  const words = titleWords(letter.say_it);
  const meaningCell = language === 'ms' ? letter.malay : letter.english;
  const meanings = words.length === 2 ? pairOf(meaningCell) : [firstWord(meaningCell)];
  const link = language === 'ms' ? 'untuk' : 'for';
  const sound = letter.sound_with_fatha;
  const line = (i) => `${name} ${link} ${words[i] ?? words[0]}, ${meanings[i] ?? meanings[0]}!`;
  const second = words.length === 2 ? 1 : 0;
  return `${line(0)} ${line(second)} ${cap(sound)}, ${sound}, ${sound}!`;
}

/** Sentence chant from the pack's pattern (marker + word). The letter row
 * already carries the right marker for its word; for the first letter the
 * cell lists both, and the first pairs with the first word. Joins two
 * reviewed strings with a space - nothing else is added. */
export function sentencePattern(letter) {
  const marker = (letter.hadha_hadhihi || '').split('/')[0].trim();
  const word = firstWord(letter.main_word);
  if (!marker || !word) return null;
  return `${marker} ${word}`;
}

const TATWEEL = 'ـ';
const ALIF_FORMS = ['ا', 'أ', 'إ', 'آ']; // ا أ إ آ
const isMark = (ch) => /[ً-ٰٟۖ-ۭ]/.test(ch);

/** Letter characters a letter-cell stands for: "ا / أ" -> [ا, أ, إ, آ],
 * "هـ" -> [ه]. Reads characters out of the pack's cell; adds nothing else
 * except the other alif hamza shapes for alif. */
export function letterChars(cell) {
  const chars = (cell || '')
    .split('/')
    .map((s) => s.replace(TATWEEL, '').trim())
    .filter(Boolean)
    .map((s) => s[0]);
  return chars.some((c) => ALIF_FORMS.includes(c)) ? [...new Set([...chars, ...ALIF_FORMS])] : chars;
}

/** The single glyph to show/trace for a letter cell ("ا / أ" -> "ا"). */
export function primaryGlyph(cell) {
  return letterChars(cell)[0] ?? '';
}

/** Splits a word into clusters (base letter + its marks) flagged on/off for
 * highlighting. Colour-only styling on the spans keeps Arabic shaping intact. */
export function highlightClusters(word, cell) {
  const targets = new Set(letterChars(cell));
  const clusters = [];
  for (const ch of word || '') {
    if (isMark(ch) && clusters.length) clusters[clusters.length - 1].text += ch;
    else clusters.push({ text: ch, on: targets.has(ch) });
  }
  return clusters;
}

/** Vowel variants (fatha/kasra/damma) are introduced from this letter on
 * ("after the first set of letters" - the spec gives no number). */
export const VOWELS_FROM_LETTER = 1;

const FATHA = 'َ';
const KASRA = 'ِ';
const DAMMA = 'ُ';

/** Fatha/kasra/damma forms of a letter, built mechanically from the pack's
 * letter cell + the three standard marks (no words are authored). Alif is
 * carried by its hamza forms, as is standard. Transliteration derives from
 * the pack's "sound with fatha" ("ba" -> ba / bi / bu). */
export function vowelForms(cell, soundWithFatha) {
  const chars = letterChars(cell);
  const isAlif = chars.some((c) => ALIF_FORMS.includes(c));
  const stem = soundWithFatha && soundWithFatha.endsWith('a') ? soundWithFatha.slice(0, -1) : soundWithFatha || '';
  const carrier = (mark) => (isAlif ? (mark === KASRA ? 'إ' : 'أ') : chars[0]);
  return [
    { key: 'fatha', arabic: carrier(FATHA) + FATHA, say: `${stem}a` },
    { key: 'kasra', arabic: carrier(KASRA) + KASRA, say: `${stem}i` },
    { key: 'damma', arabic: carrier(DAMMA) + DAMMA, say: `${stem}u` },
  ];
}

/** Number part of an item id ('L07' -> 7, 'P07' -> 7). */
export function idNumber(id) {
  const m = /(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
}

/** Practical Life age rules from the pack. */
export function minAgeFromBand(ageBand) {
  const m = /(\d+)\s*\+/.exec(ageBand || '');
  return m ? Number(m[1]) : 0;
}

const EN_KEY = {
  wudu_lesson: 'kid_friendly_text_en',
  wudu_step: 'kid_text_en',
  wudu_breaker: 'rule_en',
  movement: 'kid_text_en',
  prayer_time: 'when_en',
  host_line: 'english',
  reaction: 'english',
  letter: 'english',
};
const MS_KEY = {
  wudu_lesson: 'teks_ms',
  wudu_step: 'teks_ms',
  wudu_breaker: 'peraturan_ms',
  movement: 'teks_ms',
  prayer_time: 'bila_ms',
  host_line: 'malay',
  reaction: 'malay',
  letter: 'malay',
};

/** The kid-facing sentence for an item in the child's language (Arabic UI
 * shows English meanings - the pack only supplies EN and MS). */
export function localized(item, language) {
  const d = item.data || {};
  if (language === 'ar') {
    // Arabic wording from the reviewed overlay (content/i18n-overlay.json); a few
    // pack rows (reactions) already carry their own Arabic.
    const own = d.arabic_optional && d.arabic_optional !== '—' ? d.arabic_optional.split('/')[0].trim() : '';
    const text = d.i18n?.ar?.text || own;
    if (text) return plain(text);
  }
  const en = d[EN_KEY[item.kind] ?? 'en'];
  const ms = d[MS_KEY[item.kind] ?? 'ms'];
  return kidText(plain(language === 'ms' ? ms || en : en));
}

const TITLE_KEY = { wudu_step: 'step', wudu_lesson: 'lesson', movement: 'movement', phrase: 'moment', dua: 'situation', prayer_time: 'prayer' };

/** The short heading for an item in the child's language. Arabic and Malay come
 * from the reviewed overlay; otherwise the pack's own (English) heading. A
 * movement's Arabic heading is the Arabic name already in the pack. */
export function titleOf(item, language) {
  const d = item.data || {};
  const own = d.i18n?.[language]?.title;
  if (own) return own;
  if (language === 'ar' && item.kind === 'movement' && d.arabic) return d.arabic;
  return plain(d[TITLE_KEY[item.kind]] ?? '');
}

/** An Arabic item's meaning line in the child's language. In the Arabic UI the
 * Arabic text is itself the content, so scripture shows no translation line. */
export function meaningOf(data, language) {
  if (language === 'ar') return '';
  return (language === 'ms' ? data.ms || data.en : data.en || data.ms) || '';
}

/** Drops notes meant for the author or reviewer from text a child sees or hears:
 * a trailing "⚠ ..." note, "Wording must be sensitive." and internal item codes
 * like "(SY-01)". Used for kid-facing text and audio scripts, never in admin review. */
export function kidText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\s*⚠.*$/s, '')
    .replace(/\s*(Wording must be sensitive|Perlu bahasa yang sesuai)\.?/g, '')
    .replace(/\s*\((?:[A-Z]{2}-\d+(?:,\s*)?)+\)/g, '')
    .trim();
}

/** "أَسَد (also أَرْنَب)" -> ["أَسَد", "أَرْنَب"]; "بَطَّة" -> ["بَطَّة"]. Slices only. */
export function arabicWords(cell) {
  const m = /^(.+?)\s*\((?:also\s+)?(.+)\)\s*$/.exec((cell || '').trim());
  return m ? [m[1].trim(), m[2].trim()] : [firstWord(cell)];
}

/** Fisher-Yates, returns a new array. */
export function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/** Display text for a Hisn al-Muslim row whose verbatim text is in `raw`.
 * Slices only - never edits a letter or mark: for rows wrapped in ((...)) it
 * keeps what is inside the brackets (dropping the trailing count note and any
 * [evening wording] after them); otherwise it drops only [bracketed notes]. */
export function arabicFromRaw(raw) {
  const s = (raw || '').trim();
  const m = /^\(\((.+?)\)\)/s.exec(s);
  const text = m ? m[1] : s.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s*\([^)]*\)\s*$/, '');
  return text.replace(/\s+/g, ' ').trim();
}

/** What Hudi says in the "find the letter" game. Used by the lesson (text on
 * screen), by the import script (audio manifest) and by the voice generator,
 * so the words on screen and the clip always match. */
export function findLetterTexts(d) {
  const en = d.name_say;
  const ar = d.name_ar;
  return {
    ask: { en: `Find the letter ${en}!`, ms: `Cari huruf ${en}!`, ar: `اِبْحَثْ عَنْ حَرْفِ ${ar}!` },
    wrong: { en: `This is not ${en}. Try again!`, ms: `Ini bukan ${en}. Cuba lagi!`, ar: `هَذَا لَيْسَ ${ar}. حَاوِلْ مَرَّةً أُخْرَى!` },
  };
}

export const FIND_OK_TEXT = {
  en: 'Mashallah! You found it!',
  ms: 'Masya-Allah! Kamu jumpa!',
  ar: 'مَا شَاءَ اللَّهُ! لَقَدْ وَجَدْتَهُ!',
};
