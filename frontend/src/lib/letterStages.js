// The interactive letters (28 of them) are grouped into 4 stages. A stage opens when
// the previous stage's "Find the letter" test has been passed (sticker `letter-stage-N`).
// Stage 1 is the free one (letters 1-6 are free in the content table).
import { primaryGlyph } from './contentHelpers.js';
import { LETTER_PICTURE_EMOJI } from './letterPictures.js';
import { LETTER_ART } from '../components/animals/AnimalArt.jsx';

export const LETTER_STAGES = [
  { n: 1, from: 1, to: 6, accent: 'var(--color-blue)' },
  { n: 2, from: 7, to: 14, accent: 'var(--color-teal)' },
  { n: 3, from: 15, to: 22, accent: 'var(--color-purple)' },
  { n: 4, from: 23, to: 28, accent: 'var(--color-orange)' },
];

export const PASS_RATIO = 0.6; // share of test letters found on the first try to pass

export const stageStickerId = (n) => `letter-stage-${n}`;

export function stageOfLetter(letterNo) {
  return LETTER_STAGES.find((s) => letterNo >= s.from && letterNo <= s.to) ?? LETTER_STAGES[0];
}

export function stageLetterRows(rows, stage) {
  return rows.filter((r) => r.orderIndex >= stage.from && r.orderIndex <= stage.to);
}

/** A stage is open for a learner when it is stage 1, the previous stage's test is passed, or they are an admin. */
export function stageOpen(stageNo, passedStageNos, admin = false) {
  return admin || stageNo === 1 || passedStageNos.includes(stageNo - 1);
}

/** Flat item for games/printables from a full content row (needs row.data). */
export function letterItem(row, language = 'en') {
  const d = row.data ?? {};
  const art = LETTER_ART[row.id]?.[0];
  return {
    id: row.id,
    no: row.orderIndex,
    glyph: primaryGlyph(d.letter ?? row.label ?? ''),
    name: language === 'ar' ? d.name_ar ?? d.name_say : d.name_say,
    nameAr: d.name_ar ?? d.name_say,
    art,
    emoji: LETTER_PICTURE_EMOJI[row.id] ?? '❔',
    english: language === 'ms' ? d.malay : d.english,
    row,
  };
}
