// Standalone, additive-only seeder for placement_questions on the LIVE
// project. Does NOT touch any other table (unlike seed.mjs, which fully
// drops and rebuilds levels/stages/lessons and would wipe real signups).
// Run once, after supabase/add_placement_and_badges.sql has been applied
// via the Supabase SQL Editor.
//
// Usage: node supabase/seed_placement_questions_only.mjs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in the environment (.env).');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// Keyed by stage order_index (1-16), matching supabase/seed.mjs's
// PLACEMENT_QUESTIONS constant — kept in sync manually since seed.mjs can't
// be imported without triggering its own destructive reseed.
const QUESTIONS_BY_ORDER = {
  1: { instruction: 'Which of these is the Arabic letter "alif"?', options: ['ا', 'ب', 'ت', 'ث'], correct_answer: 'ا' },
  2: {
    instruction: 'What sound does the mark  ِ  (kasra) make under a letter?',
    options: ['a short "i" sound', 'a short "a" sound', 'a short "u" sound', 'no sound at all'],
    correct_answer: 'a short "i" sound',
  },
  3: {
    instruction: 'Which harakah (vowel mark) makes a short "u" sound?',
    options: ['Damma (ُ)', 'Fatha (َ)', 'Kasra (ِ)', 'Sukoon (ْ)'],
    correct_answer: 'Damma (ُ)',
  },
  4: {
    instruction: 'What does a sukoon (ْ) over a letter mean?',
    options: ['the letter has no vowel sound', 'the letter is doubled', 'the vowel is lengthened', 'the letter is silent (dropped)'],
    correct_answer: 'the letter has no vowel sound',
  },
  5: {
    instruction: 'When Arabic letters connect to form a word, what usually changes?',
    options: ['their shape', 'their meaning', 'their sound', 'nothing changes'],
    correct_answer: 'their shape',
  },
  6: {
    instruction: 'Which of these is a complete 3-letter word, not just a single letter?',
    options: ['بَيْت', 'ب', 'ت', 'ك'],
    correct_answer: 'بَيْت',
  },
  7: { instruction: 'What does the word "سَلَام" mean?', options: ['peace', 'book', 'light', 'religion'], correct_answer: 'peace' },
  8: {
    instruction: 'What does the phrase "بِسْمِ اللَّه" mean?',
    options: ['In the name of Allah', 'Praise be to Allah', 'Allah is Greatest', 'There is no god but Allah'],
    correct_answer: 'In the name of Allah',
  },
  9: {
    instruction: 'Which ending typically marks a feminine noun in Arabic (e.g. مُعَلِّمَة)?',
    options: ['ة  (taa marbuta)', 'ون', 'ين', 'ات'],
    correct_answer: 'ة  (taa marbuta)',
  },
  10: {
    instruction: 'What does the prefix "ال" (al-) do to an Arabic noun?',
    options: ['makes it definite ("the")', 'makes it plural', 'makes it feminine', 'turns it into a question'],
    correct_answer: 'makes it definite ("the")',
  },
  11: { instruction: 'What does the preposition "فِي" mean?', options: ['in', 'on', 'with', 'from'], correct_answer: 'in' },
  12: {
    instruction: 'In an Idafa (possessive) phrase like "كِتَابُ اللهِ", what does it mean?',
    options: ['The book of Allah', 'A book about Allah', 'Books and Allah', "Allah's books"],
    correct_answer: 'The book of Allah',
  },
  13: {
    instruction: 'The verb ending "تُ" (as in كَتَبْتُ) tells you the subject is:',
    options: ['I (past tense)', 'you (past tense)', 'she (past tense)', 'they (past tense)'],
    correct_answer: 'I (past tense)',
  },
  14: {
    instruction: 'The prefix "يَ" at the start of a verb (e.g. يَكْتُبُ) tells you it is:',
    options: ['present tense, he/it', 'present tense, I', 'past tense, they', 'present tense, we'],
    correct_answer: 'present tense, he/it',
  },
  15: {
    instruction: 'In "إِيَّاكَ نَعْبُدُ" (You alone we worship), what does "نَعْبُدُ" mean?',
    options: ['we worship', 'you worship', 'he worships', 'they worship'],
    correct_answer: 'we worship',
  },
  16: {
    instruction: 'Which surah is traditionally recited in every unit (rakah) of the five daily prayers?',
    options: ['Al-Fatihah', 'Al-Ikhlas', 'An-Nas', 'Al-Kawthar'],
    correct_answer: 'Al-Fatihah',
  },
};

async function run() {
  const { data: existing, error: existingError } = await supabase.from('placement_questions').select('id').limit(1);
  if (existingError) {
    console.error('placement_questions table not found — run supabase/add_placement_and_badges.sql in the Supabase SQL Editor first.');
    console.error(existingError.message);
    process.exit(1);
  }
  if (existing.length > 0) {
    console.log('placement_questions already has rows — skipping (delete existing rows first if you want to reseed).');
    return;
  }

  const { data: stages, error: stagesError } = await supabase.from('stages').select('id, order_index').order('order_index');
  if (stagesError) throw new Error(stagesError.message);
  if (stages.length !== 16) {
    console.warn(`Expected 16 stages, found ${stages.length}. Proceeding with what's there.`);
  }

  for (const stage of stages) {
    const q = QUESTIONS_BY_ORDER[stage.order_index];
    if (!q) continue;
    const { error } = await supabase.from('placement_questions').insert({
      stage_id: stage.id,
      instruction: q.instruction,
      options: q.options,
      correct_answer: q.correct_answer,
    });
    if (error) throw new Error(`Failed to insert placement question for stage order ${stage.order_index}: ${error.message}`);
  }
  console.log(`Seeded ${stages.length} placement questions.`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
