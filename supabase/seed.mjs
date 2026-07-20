// ArabiKids v2 seed — one continuous curriculum: 4 Levels x 4 Stages x 8-10
// Lessons (~150-160 total), each Stage gated by periodic checkpoints (every
// 3 lessons) plus a final mastery checkpoint that unlocks the next Stage.
//
// Content strategy (see plan): reuse every item from the old 90-lesson
// Junior/Explorer seed where it topically matches the new stage map, then
// fill remaining slots with new lessons built the same way — real Arabic
// words/phrases tied to a specific, well-known Quranic occurrence. Where new
// content was needed, it deliberately sticks to extremely well-known material
// (Al-Fatihah, Al-Ikhlas, An-Nas, Ayat al-Kursi, common Islamic vocabulary)
// rather than obscure citations, to keep accuracy risk low — but per the
// original seed's own caveat, ALL of this still needs review by a qualified
// Arabic/Islamic studies scholar before real users see it.
//
// Usage: node supabase/seed.mjs   (reads SUPABASE_URL + SUPABASE_SERVICE_KEY from env)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'node:url';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in the environment (.env).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function shuffle(arr) {
  const a = [...new Set(arr)];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickDistractors(pool, exclude, n) {
  return shuffle(pool.filter((x) => x !== exclude)).slice(0, n);
}

// ---------------------------------------------------------------------------
// LEVELS + STAGES
// ---------------------------------------------------------------------------

const LEVELS = [
  { key: 'beginner', name: 'Beginner', order_index: 1, description: 'Letters & Sounds' },
  { key: 'elementary', name: 'Elementary', order_index: 2, description: 'Words Take Shape' },
  { key: 'intermediate', name: 'Intermediate', order_index: 3, description: 'Grammar Foundations' },
  { key: 'advanced', name: 'Advanced', order_index: 4, description: 'Verbs, Sentences & Application' },
];

export const STAGES = [
  { key: 'stage1', levelKey: 'beginner', name: 'Letter Shapes I', order_index: 1, min_placement_age: 3, is_free: true },
  { key: 'stage2', levelKey: 'beginner', name: 'Letter Shapes II & Harakat Intro', order_index: 2, min_placement_age: 3, is_free: false },
  { key: 'stage3', levelKey: 'beginner', name: 'Harakat Mastery', order_index: 3, min_placement_age: 4, is_free: false },
  { key: 'stage4', levelKey: 'beginner', name: 'Tanween & Sukoon', order_index: 4, min_placement_age: 4, is_free: false },
  { key: 'stage5', levelKey: 'elementary', name: 'Connecting Letters & Madd', order_index: 5, min_placement_age: 5, is_free: false },
  { key: 'stage6', levelKey: 'elementary', name: 'First 3-Letter Words', order_index: 6, min_placement_age: 5, is_free: false },
  { key: 'stage7', levelKey: 'elementary', name: 'Islamic Vocabulary I', order_index: 7, min_placement_age: 6, is_free: false },
  { key: 'stage8', levelKey: 'elementary', name: 'Islamic Vocabulary II & Phrases', order_index: 8, min_placement_age: 6, is_free: false },
  { key: 'stage9', levelKey: 'intermediate', name: 'Nouns & Gender', order_index: 9, min_placement_age: 7, is_free: false },
  { key: 'stage10', levelKey: 'intermediate', name: 'Demonstratives & Definite Article', order_index: 10, min_placement_age: 7, is_free: false },
  { key: 'stage11', levelKey: 'intermediate', name: 'Prepositions & Location', order_index: 11, min_placement_age: 8, is_free: false },
  { key: 'stage12', levelKey: 'intermediate', name: 'Questions & Possession (Idafa)', order_index: 12, min_placement_age: 8, is_free: false },
  { key: 'stage13', levelKey: 'advanced', name: 'Pronouns & Past Tense Verbs', order_index: 13, min_placement_age: 9, is_free: false },
  { key: 'stage14', levelKey: 'advanced', name: 'Present Tense & Plurals', order_index: 14, min_placement_age: 9, is_free: false },
  { key: 'stage15', levelKey: 'advanced', name: 'Complex Sentences & Quranic Patterns', order_index: 15, min_placement_age: 10, is_free: false },
  { key: 'stage16', levelKey: 'advanced', name: 'Fluency & Quranic Application (Capstone)', order_index: 16, min_placement_age: 10, is_free: false },
];

// ---------------------------------------------------------------------------
// SHARED LETTER DATA — [letter, name, quranicWord, meaning, reference]
// (ported from the v1 seed's JUNIOR_LETTERS, used for Stages 1-2)
// ---------------------------------------------------------------------------

// Each row: [letter, name, quranicWord, meaning, reference, transliteration].
// Transliteration is a simplified, kid-friendly phonetic spelling (not
// strict ALA-LC/IJMES romanization) - close enough to sound out, not a
// scholarly pronunciation guide.
const LETTERS = [
  ['ا', 'alif', 'اللّٰه', 'Allah', 'used throughout the Quran', 'Allah'],
  ['ب', 'baa', 'بِسْمِ', 'in the name of', 'Surah Al-Fatihah 1:1', 'Bismi'],
  ['ت', 'taa', 'تَبَارَكَ', 'blessed is He', 'Surah Al-Mulk 67:1', 'Tabaraka'],
  ['ث', 'thaa', 'ثَبَات', 'steadfastness', 'a quality asked for in dua', 'Thabat'],
  ['ج', 'jeem', 'جَنَّة', 'Paradise', 'mentioned throughout the Quran', 'Jannah'],
  ['ح', 'haa', 'حَمْد', 'praise', 'Surah Al-Fatihah 1:2', 'Hamd'],
  ['خ', 'khaa', 'خَالِق', 'the Creator', 'a name of Allah', 'Khaliq'],
  ['د', 'daal', 'دِين', 'religion / way of life', 'Surah Al-Fatihah 1:4', 'Deen'],
  ['ذ', 'dhaal', 'ذِكْر', 'remembrance', 'remembrance of Allah', 'Dhikr'],
  ['ر', 'raa', 'رَحْمَٰن', 'Most Merciful', 'Surah Al-Fatihah 1:3', 'Rahman'],
  ['ز', 'zaay', 'زَكَاة', 'purifying charity', 'a pillar of Islam', 'Zakah'],
  ['س', 'seen', 'سَلَام', 'peace', 'a name of Allah and Islamic greeting', 'Salam'],
  ['ش', 'sheen', 'شُكْر', 'gratitude', 'being thankful to Allah', 'Shukr'],
  ['ص', 'saad', 'صِرَاط', 'the path', 'Surah Al-Fatihah 1:6', 'Sirat'],
  ['ض', 'daad', 'ضُحَى', 'morning brightness', 'Surah Ad-Duha 93:1', 'Duha'],
  ['ط', 'taa (heavy)', 'طه', 'Taha', 'opening letters of Surah Taha 20:1', 'Taha'],
  ['ظ', 'dhaa (heavy)', 'ظُلْم', 'wrongdoing', 'what Allah warns against', 'Dhulm'],
  ['ع', 'ayn', 'عَالَمِين', 'all the worlds', 'Surah Al-Fatihah 1:2', "Aalameen"],
  ['غ', 'ghayn', 'غَفُور', 'Most Forgiving', 'a name of Allah', 'Ghafoor'],
  ['ف', 'faa', 'فَاتِحَة', 'the opening', 'the first surah of the Quran', 'Fatihah'],
  ['ق', 'qaaf', 'قُرْآن', 'the recitation', 'the final revelation', 'Quran'],
  ['ك', 'kaaf', 'كِتَاب', 'book', 'often refers to the Quran', 'Kitab'],
  ['ل', 'laam', 'لُطْف', 'gentleness', 'a quality of Allah', 'Lutf'],
  ['م', 'meem', 'مَلِك', 'King / Sovereign', 'Surah Al-Fatihah 1:4', 'Malik'],
  ['ن', 'noon', 'نُور', 'light', 'Surah An-Nur 24:35', 'Nur'],
  ['ه', 'haa (light)', 'هُدَى', 'guidance', 'Surah Al-Fatihah 1:6', 'Huda'],
  ['و', 'waaw', 'وَحْدَه', 'Him alone', 'La ilaha illa Allah wahdahu', 'Wahdah'],
  ['ي', 'yaa', 'يَوْم', 'day', 'Surah Al-Fatihah 1:4', 'Yawm'],
];

const HARAKAT = [
  ['فَتْحَة (Fatha)', 'a short "a" sound, as in the بَ of تَبَارَكَ', 'بَ', 'the "ba" sound', 'Surah Al-Mulk 67:1', 'Ba'],
  ['كَسْرَة (Kasra)', 'a short "i" sound, as in the بِ of بِسْمِ', 'بِ', 'the "bi" sound', 'Surah Al-Fatihah 1:1', 'Bi'],
  ['ضَمَّة (Damma)', 'a short "u" sound, as in the هُ of هُدَى', 'هُ', 'the "hu" sound', 'Surah Al-Fatihah 1:6', 'Hu'],
  ['تَنْوِين (Tanween)', 'a doubled ending sound, as in سَلَامٌ', 'سَلَامٌ', 'peace (indefinite)', 'Surah Al-Qadr 97:5', 'Salamun'],
  ['شَدَّة وسُكُون (Shaddah & Sukoon)', 'a doubled letter and a silent letter, as in اللّٰه', 'اللّٰه', 'Allah', 'used throughout the Quran', 'Allah'],
];

// ---------------------------------------------------------------------------
// Generic helpers: turn a flat list of content items into lessons + stage
// checkpoints (periodic every 3 lessons, final one always is_mastery).
// ---------------------------------------------------------------------------

function itemsAllMeanings(items) {
  return items.map((it) => it.meaning);
}
function itemsAllReferences(items) {
  return items.map((it) => it.reference);
}

export function buildLessons(stageKey, items, { minutes = 8 } = {}) {
  return items.map((item, i) => ({
    stageKey,
    order_index: i + 1,
    title: item.title,
    lesson_goal: item.goal,
    arabic_word: item.arabicWord,
    arabic_word_meaning: item.meaning,
    estimated_minutes: minutes,
    content: {
      type: item.type || 'vocabulary',
      concept: item.concept,
      transliteration: item.transliteration,
      ...(item.extra || {}),
      quranicConnection: {
        arabic: item.arabicWord,
        translation: item.meaning,
        reference: item.reference,
        note: `"${item.arabicWord}" (${item.meaning}) is found in ${item.reference}.`,
      },
    },
  }));
}

function checkpointBoundaries(lessonCount) {
  const bounds = [];
  for (let after = 3; after < lessonCount; after += 3) bounds.push(after);
  bounds.push(lessonCount);
  return bounds;
}

// Builds the stage's checkpoints (periodic + final mastery), each with 3
// questions (word meaning / concept check / Quran connection) drawn from the
// lessons that checkpoint covers.
function buildStageCheckpoints(items) {
  const meaningPool = itemsAllMeanings(items);
  const referencePool = itemsAllReferences(items);
  const conceptPool = items.map((it) => it.title);
  const bounds = checkpointBoundaries(items.length);

  let prevBound = 0;
  return bounds.map((bound, ci) => {
    const covered = items.slice(prevBound, bound);
    prevBound = bound;
    const pick = (i) => covered[i % covered.length];

    const a = pick(0);
    const b = pick(1);
    const c = pick(2);

    const questions = [
      {
        question_number: 1,
        title: 'Word Meaning',
        instruction: `What does "${a.arabicWord}" mean?`,
        options: shuffle([a.meaning, ...pickDistractors(meaningPool, a.meaning, 3)]),
        correct_answer: a.meaning,
        explanation: `"${a.arabicWord}" means "${a.meaning}".`,
      },
      {
        question_number: 2,
        title: 'Concept Check',
        instruction: `Which lesson covered "${b.arabicWord}"?`,
        options: shuffle([b.title, ...pickDistractors(conceptPool, b.title, 3)]),
        correct_answer: b.title,
        explanation: `"${b.arabicWord}" was taught in "${b.title}".`,
      },
      {
        question_number: 3,
        title: 'Quran Connection',
        instruction: `Where is "${c.arabicWord}" found in the Quran?`,
        options: shuffle([c.reference, ...pickDistractors(referencePool, c.reference, 3)]),
        correct_answer: c.reference,
        explanation: `"${c.arabicWord}" (${c.meaning}) is found in ${c.reference}.`,
      },
    ];

    return { checkpoint_order: ci + 1, is_mastery: bound === items.length, questions };
  });
}

// ---------------------------------------------------------------------------
// STAGE CONTENT
// ---------------------------------------------------------------------------

function letterPairItem([l1, n1, w1, m1, r1, t1], [l2, n2, w2, m2, r2, t2]) {
  return {
    title: `Letters ${l1} & ${l2} (${n1}, ${n2})`,
    goal: `Recognise ${l1} and ${l2}, and meet them inside real Quranic words.`,
    arabicWord: w1,
    meaning: m1,
    reference: r1,
    transliteration: t1,
    type: 'letter-pair',
    concept: `Learn to recognise, sound out and write the letters ${l1} (${n1}) and ${l2} (${n2}).`,
    extra: {
      letters: [l1, l2],
      secondWord: { arabic: w2, translation: m2, reference: r2, transliteration: t2 },
    },
  };
}

function harakatItem([title, desc, word, meaning, reference, transliteration]) {
  return {
    title,
    goal: `Learn the ${title.split(' ')[0]} vowel mark and hear it in a Quranic word.`,
    arabicWord: word,
    meaning,
    reference,
    transliteration,
    type: 'harakat',
    concept: desc,
  };
}

function practiceItem([, , word, meaning, reference, transliteration], harakatLabel) {
  return {
    title: `Practice: ${harakatLabel} in "${word}"`,
    goal: `Spot the ${harakatLabel} mark inside a word you've already learned.`,
    arabicWord: word,
    meaning,
    reference,
    transliteration,
    type: 'harakat-practice',
    concept: `Look for the ${harakatLabel} mark in "${word}" ("${meaning}") and sound it out.`,
  };
}

// --- Stage 1: Letter Shapes I (8 lessons = 8 letter-pairs = letters 1-16) ---
const stage1Items = [];
for (let i = 0; i < 16; i += 2) stage1Items.push(letterPairItem(LETTERS[i], LETTERS[i + 1]));

// --- Stage 2: Letter Shapes II & Harakat Intro (6 pairs = letters 17-28, + Fatha + Kasra) ---
const stage2Items = [];
for (let i = 16; i < 28; i += 2) stage2Items.push(letterPairItem(LETTERS[i], LETTERS[i + 1]));
stage2Items.push(harakatItem(HARAKAT[0])); // Fatha
stage2Items.push(harakatItem(HARAKAT[1])); // Kasra

// --- Stage 3: Harakat Mastery (Damma + 7 practice, reusing earlier letters) ---
const stage3Items = [
  harakatItem(HARAKAT[2]), // Damma
  practiceItem(LETTERS[1], 'Fatha'), // baa -> Bismi
  practiceItem(LETTERS[2], 'Fatha'), // taa -> Tabaraka
  practiceItem(LETTERS[5], 'Fatha'), // haa -> Hamd
  practiceItem(LETTERS[9], 'Fatha'), // raa -> Rahman
  practiceItem(LETTERS[25], 'Damma'), // haa-light -> Huda
  practiceItem(LETTERS[24], 'Damma'), // noon -> Nur
  practiceItem(LETTERS[7], 'Kasra'), // daal -> Deen
];

// --- Stage 4: Tanween & Sukoon (Tanween + Shaddah/Sukoon + 6 practice) ---
const stage4Items = [
  harakatItem(HARAKAT[3]), // Tanween
  harakatItem(HARAKAT[4]), // Shaddah & Sukoon
  practiceItem(LETTERS[3], 'Sukoon'), // thaa -> Thabat
  practiceItem(LETTERS[10], 'Tanween'), // zaay -> Zakat
  practiceItem(LETTERS[13], 'Sukoon'), // saad -> Sirat
  practiceItem(LETTERS[18], 'Tanween'), // ghayn -> Ghafoor
  practiceItem(LETTERS[20], 'Sukoon'), // qaaf -> Quran
  practiceItem(LETTERS[22], 'Sukoon'), // laam -> Lutf
];

// --- Stage 5: Connecting Letters & Madd (8 lessons) ---
// `maddPair` (Stage 5 only): { short: {arabic, transliteration, label}, long: {arabic, transliteration, label} }
// for the harakat-vs-madd-letter tap-to-compare UI - reuses the same `extra`
// passthrough buildLessons() already spreads into content for letterPairItem.
function simpleItem(title, goal, arabicWord, meaning, reference, transliteration, { type = 'vocabulary', concept, maddPair } = {}) {
  return {
    title,
    goal,
    arabicWord,
    meaning,
    reference,
    transliteration,
    type,
    concept: concept || `${title}: focus word ${arabicWord} ("${meaning}").`,
    ...(maddPair ? { extra: { maddPair } } : {}),
  };
}
const stage5Items = [
  simpleItem('Father', 'Read the connected word for "father".', 'أَب', 'father', 'Surah Yusuf 12:4, Yusuf speaking to his father', 'Ab'),
  simpleItem('Mother', 'Read the connected word for "mother".', 'أُمّ', 'mother', 'Surah Al-Qasas 28:7, the mother of Musa', 'Umm'),
  simpleItem('Son / Child', 'Read the connected word for "son".', 'اِبْن', 'son', 'Surah Maryam 19:34, "Isa, the son of Maryam"', 'Ibn'),
  simpleItem('Brother', 'Read the connected word for "brother".', 'أَخ', 'brother', 'Surah Yusuf 12:8, the brothers of Yusuf', 'Akh'),
  simpleItem('Madd: He Said', 'Hear the long "aa" (madd) sound in a common Quranic verb.', 'قَالَ', 'he said', 'used throughout the Quran to introduce speech', 'Qala', {
    type: 'madd',
    maddPair: {
      short: { arabic: 'قَ', transliteration: 'Qa', label: 'Short (1 count)' },
      long: { arabic: 'قَا', transliteration: 'Qaa', label: 'Long (2 counts) - alif madd' },
    },
  }),
  simpleItem('Madd: He Came', 'Hear the long "aa" (madd) sound in another common verb.', 'جَاءَ', 'he came', 'used throughout the Quran', "Ja'a", {
    type: 'madd',
    maddPair: {
      short: { arabic: 'جَ', transliteration: 'Ja', label: 'Short (1 count)' },
      long: { arabic: 'جَا', transliteration: 'Jaa', label: 'Long (2 counts) - alif madd' },
    },
  }),
  simpleItem('Madd: Book', 'Hear the long "aa" (madd) sound in a word you already know.', 'كِتَاب', 'book', 'often refers to the Quran', 'Kitab', {
    type: 'madd',
    maddPair: {
      short: { arabic: 'تَ', transliteration: 'Ta', label: 'Short (1 count)' },
      long: { arabic: 'تَا', transliteration: 'Taa', label: 'Long (2 counts) - alif madd' },
    },
  }),
  simpleItem('Madd: Light', 'Hear the long "oo" (madd) sound in a word you already know.', 'نُور', 'light', 'Surah An-Nur 24:35', 'Nur', {
    type: 'madd',
    maddPair: {
      short: { arabic: 'نُ', transliteration: 'Nu', label: 'Short (1 count)' },
      long: { arabic: 'نُو', transliteration: 'Nuu', label: 'Long (2 counts) - waw madd' },
    },
  }),
];

// --- Stage 6: First 3-Letter Words (10 lessons: colours + numbers + shapes) ---
const stage6Items = [
  simpleItem('Colour: Yellow', 'Learn the colour yellow.', 'أَصْفَر', 'yellow', 'Surah Al-Baqarah 2:69, describing a bright yellow cow', 'Asfar', { type: 'color' }),
  simpleItem('Colour: White', 'Learn the colour white.', 'أَبْيَض', 'white', 'Surah Fatir 35:27, describing white mountain streaks', 'Abyad', { type: 'color' }),
  simpleItem('Colour: Green', 'Learn the colour green.', 'أَخْضَر', 'green', 'Surah Al-Insan 76:21, the green garments of Paradise', 'Akhdar', { type: 'color' }),
  simpleItem('Colour: Black', 'Learn the colour black.', 'أَسْوَد', 'black', 'Surah Fatir 35:27, describing black mountain streaks', 'Aswad', { type: 'color' }),
  simpleItem('Numbers 1-3', 'Learn one, two, three and their Quranic connection.', 'وَاحِد', 'one', 'Surah Al-Ikhlas 112:1, "Qul huwa Allahu ahad"', 'Wahid', { type: 'number' }),
  simpleItem('Numbers 4-6', 'Learn four, five, six and their Quranic connection.', 'سِتَّة', 'six', "Surah Al-A'raf 7:54, heavens and earth in six days", 'Sittah', { type: 'number' }),
  simpleItem('Numbers 7-9', 'Learn seven, eight, nine and their Quranic connection.', 'سَبْع', 'seven', 'Surah Al-Hijr 15:87, "the seven oft-repeated verses"', "Sab'", { type: 'number' }),
  simpleItem('Number 10', 'Learn ten and its Quranic connection.', 'عَشْر', 'ten', 'Surah Al-Fajr 89:2, "by the ten nights"', 'Ashr', { type: 'number' }),
  simpleItem('Shape: Circle', 'Learn the word for circle.', 'دَائِرَة', 'circle', 'a shape seen throughout Allah’s creation', "Da'irah", { type: 'shape' }),
  simpleItem('Shape: Crescent', 'Learn the word for crescent moon.', 'هِلَال', 'crescent moon', 'a symbol used to mark Islamic months', 'Hilal', { type: 'shape' }),
];

// --- Stage 7: Islamic Vocabulary I (10 lessons) ---
const stage7Items = [
  simpleItem('Allah', 'The name of God in Islam.', 'اللّٰه', 'Allah', 'used throughout the Quran', 'Allah'),
  simpleItem('Rabb', 'A name meaning "Lord" or "Sustainer".', 'رَبّ', 'Lord', 'Surah Al-Fatihah 1:2, "Rabbil-’alameen"', 'Rabb'),
  simpleItem('Salah', 'The Arabic word for the ritual prayer.', 'صَلَاة', 'prayer', 'Surah Al-Baqarah 2:3, "those who establish prayer"', 'Salah'),
  simpleItem('Quran', 'The final revelation, recited by Muslims worldwide.', 'قُرْآن', 'the recitation', 'the final revelation', 'Quran'),
  simpleItem('Nabi', 'The Arabic word for a Prophet.', 'نَبِيّ', 'Prophet', 'used throughout the Quran for Allah’s messengers', 'Nabi'),
  simpleItem('Malak', 'The Arabic word for Angel.', 'مَلَك', 'angel', 'Surah Al-Baqarah 2:30, angels mentioned to Adam’s creation', 'Malak'),
  simpleItem('Rasul', 'The Arabic word for Messenger.', 'رَسُول', 'messenger', 'used throughout the Quran for Prophets sent with a message', 'Rasul'),
  simpleItem('Ummah', 'The Arabic word for community or nation.', 'أُمَّة', 'community', 'Surah Al-Baqarah 2:143, "a middle nation"', 'Ummah'),
  simpleItem('Iman', 'The Arabic word for faith or belief.', 'إِيمَان', 'faith', 'Surah Al-Hujurat 49:14, discussing faith entering the heart', 'Iman'),
  simpleItem('Islam', 'The Arabic word meaning submission to Allah.', 'إِسْلَام', 'submission (to Allah)', 'Surah Aal-E-Imran 3:19, "the religion in the sight of Allah is Islam"', 'Islam'),
];

// --- Stage 8: Islamic Vocabulary II & Phrases (10 lessons) ---
const stage8Items = [
  simpleItem('Bismillah', 'The phrase said before starting any good action.', 'بِسْمِ اللَّهِ', 'in the name of Allah', 'Surah Al-Fatihah 1:1', 'Bismillah', { type: 'phrase' }),
  simpleItem('Alhamdulillah', 'The phrase of praise and thanks to Allah.', 'الْحَمْدُ لِلَّه', 'all praise is due to Allah', 'Surah Al-Fatihah 1:2', 'Alhamdulillah', { type: 'phrase' }),
  simpleItem('Subhanallah', 'The phrase said to glorify Allah.', 'سُبْحَانَ اللَّه', 'glory be to Allah', 'used throughout the Quran to declare Allah’s perfection', 'Subhanallah', { type: 'phrase' }),
  simpleItem('Astaghfirullah', 'The phrase said to ask Allah’s forgiveness.', 'أَسْتَغْفِرُ اللَّه', 'I seek Allah’s forgiveness', 'a phrase rooted in the Quran’s calls to seek forgiveness', 'Astaghfirullah', { type: 'phrase' }),
  simpleItem('InshaAllah', 'The phrase said when speaking of the future.', 'إِنْ شَاءَ اللَّه', 'if Allah wills', 'Surah Al-Kahf 18:23-24, commanding this phrase for future plans', 'InshaAllah', { type: 'phrase' }),
  simpleItem('MashaAllah', 'The phrase said when admiring something good.', 'مَا شَاءَ اللَّه', 'what Allah has willed', 'Surah Al-Kahf 18:39', 'MashaAllah', { type: 'phrase' }),
  simpleItem('Assalamu Alaykum', 'The Islamic greeting of peace.', 'اَلسَّلَامُ عَلَيْكُم', 'peace be upon you', 'Surah An-Nisa 4:86, the command to return greetings well', 'Assalamu Alaykum', { type: 'phrase' }),
  simpleItem('La ilaha illallah', 'The first half of the declaration of faith.', 'لَا إِلَٰهَ إِلَّا اللَّه', 'there is no god but Allah', 'Surah As-Saffat 37:35', 'La ilaha illallah', { type: 'phrase' }),
  simpleItem('Allahu Akbar', 'The phrase declaring Allah is greatest, said in prayer.', 'اللَّهُ أَكْبَر', 'Allah is greatest', 'said throughout the five daily prayers', 'Allahu Akbar', { type: 'phrase' }),
  simpleItem('Surah Al-Ikhlas, Ayah 1', 'Read the opening of a short, well-known surah.', 'قُلْ هُوَ اللَّهُ أَحَدٌ', 'Say: He is Allah, One', 'Surah Al-Ikhlas 112:1', 'Qul huwa Allahu ahad', { type: 'reading' }),
];

// --- Stage 9: Nouns & Gender (10 lessons) ---
const stage9Items = [
  simpleItem('The definite article (ال)', 'Learn how "the" attaches to the front of a noun.', 'الْحَمْدُ', 'the praise', 'Surah Al-Fatihah 1:2', 'Al-hamdu'),
  simpleItem('Gender: masculine & feminine', 'Learn how Ta Marbuta (ة) marks a feminine noun.', 'مُسْلِمَة', 'a Muslim woman', 'Surah Al-Ahzab 33:35', 'Muslimah'),
  simpleItem('Singular, dual & plural', 'Learn how nouns change for one, two, or many.', 'السَّمَاوَات', 'the heavens (plural)', 'Surah Al-Baqarah 2:29', 'As-samawat'),
  simpleItem('Sound masculine plural', 'Learn the -un/-in ending for regular masculine plurals.', 'مُسْلِمُونَ', 'Muslims (masc. plural)', 'Surah Al-Hijr 15:2', 'Muslimun'),
  simpleItem('Sound feminine plural', 'Learn the -at ending for regular feminine plurals.', 'مُسْلِمَات', 'Muslim women', 'Surah Al-Ahzab 33:35', 'Muslimat'),
  simpleItem('Broken plurals', 'Learn how some plurals change form entirely.', 'كُتُب', 'books (plural of kitab)', 'used throughout the Quran', 'Kutub'),
  simpleItem('Adjective agreement', 'Learn how adjectives must match their noun.', 'الصِّرَاطَ الْمُسْتَقِيمَ', 'the straight path', 'Surah Al-Fatihah 1:6', "As-sirata l-mustaqim"),
  simpleItem('Noun cases: intro', 'A first look at how noun endings shift with grammar role.', 'رَبُّ الْعَالَمِينَ', 'Lord of the worlds', 'Surah Al-Fatihah 1:2', "Rabbu l-alamin"),
  simpleItem('Common nouns review', 'Review key nouns learned so far in context.', 'بَيْتُ اللَّه', 'the House of Allah (the Kaaba)', 'Surah Al-Baqarah 2:125', 'Baytullah'),
  simpleItem('Stage 9 review: nouns', 'Bring together everything learned about nouns and gender.', 'الرَّحْمَٰنِ الرَّحِيمِ', 'the Most Merciful, the Especially Merciful', 'Surah Al-Fatihah 1:3', "Ar-Rahmani r-Rahim"),
];

// --- Stage 10: Demonstratives & Definite Article (10 lessons) ---
const stage10Items = [
  simpleItem('This (masculine): هذا', 'Learn the masculine word for "this".', 'هَٰذَا الْكِتَابُ', 'this is the Book', 'used to introduce the Quran in commentary', "Hadha l-kitab"),
  simpleItem('This (feminine): هذه', 'Learn the feminine word for "this".', 'هَٰذِهِ', 'this (feminine)', 'used throughout the Quran', 'Hadhihi'),
  simpleItem('That: ذلك', 'Learn the word for "that", used to open Surah Al-Baqarah.', 'ذَٰلِكَ الْكِتَابُ', 'that is the Book', 'Surah Al-Baqarah 2:2', "Dhalika l-kitab"),
  simpleItem('Sun letters', 'Learn which letters absorb the ل of ال (Ar-Rahman, not Al-Rahman).', 'الرَّحْمَٰن', 'the Most Merciful', 'Surah Al-Fatihah 1:3', 'Ar-Rahman'),
  simpleItem('Moon letters', 'Learn which letters keep the ل of ال pronounced clearly.', 'الْقَمَر', 'the moon', 'Surah Al-Qamar 54:1', 'Al-Qamar'),
  simpleItem('The Idafa (possessive) construction', 'Learn how two nouns link to show possession.', 'رَبِّ الْعَالَمِينَ', 'Lord of the worlds', 'Surah Al-Fatihah 1:2', "Rabbi l-alamin"),
  simpleItem('Idafa in practice: House of Allah', 'See the Idafa construction in a famous phrase.', 'بَيْتُ اللَّه', 'House of Allah (the Kaaba)', 'Surah Al-Baqarah 2:125', 'Baytullah'),
  simpleItem('Attached pronouns: my/your', 'Learn how ي and ك attach to nouns to mean "my" and "your".', 'رَبِّي', 'my Lord', 'used throughout the Quran', 'Rabbi'),
  simpleItem('Attached pronouns: his/her', 'Learn how ه and ها attach to nouns.', 'رَبُّهُ', 'his Lord', 'used throughout the Quran', 'Rabbuhu'),
  simpleItem('Stage 10 review: demonstratives', 'Review this/that and the sun/moon letter rule.', 'ذَٰلِكَ الصِّرَاطُ الْمُسْتَقِيم', 'that is the straight path', 'Surah Al-An’am 6:153', "Dhalika s-siratu l-mustaqim"),
];

// --- Stage 11: Prepositions & Location (10 lessons) ---
const stage11Items = [
  simpleItem('Fi: in', 'Learn the preposition "in".', 'فِي قُلُوبِهِم', 'in their hearts', 'Surah Al-Baqarah 2:10', 'Fi qulubihim'),
  simpleItem('Ala: on', 'Learn the preposition "on/upon".', 'عَلَيْهِم', 'upon them', 'used throughout the Quran', 'Alayhim'),
  simpleItem('Min: from', 'Learn the preposition "from".', 'مِنَ اللَّه', 'from Allah', 'used throughout the Quran', 'Minallah'),
  simpleItem('Ila: to', 'Learn the preposition "to/towards".', 'إِلَى اللَّه', 'to Allah', 'Surah Al-Baqarah 2:156, "to Him we return"', 'Ilallah'),
  simpleItem('Bi: with/by', 'Learn the preposition "with/by", seen in Bismillah.', 'بِسْمِ اللَّه', 'in/by the name of Allah', 'Surah Al-Fatihah 1:1', 'Bismillah'),
  simpleItem('Taht: under', 'Learn the word for "under".', 'تَحْتَهَا الْأَنْهَار', 'beneath which rivers flow', 'a phrase describing Paradise, used repeatedly in the Quran', "Tahtaha l-anhar"),
  simpleItem('Fawq: above', 'Learn the word for "above".', 'فَوْقَ', 'above', 'used throughout the Quran', 'Fawqa'),
  simpleItem('Amam: in front of', 'Learn the word for "in front of".', 'أَمَام', 'in front of', 'a common directional word in Arabic', 'Amam'),
  simpleItem('Khalf: behind', 'Learn the word for "behind".', 'خَلْف', 'behind', 'Surah Qaf 50:6, describing the sky above them', 'Khalf'),
  simpleItem('Stage 11 review: prepositions', 'Review the core location words learned in this stage.', 'مِن تَحْتِهَا الْأَنْهَار', 'from beneath which rivers flow', 'Surah Al-Baqarah 2:25', "Min tahtiha l-anhar"),
];

// --- Stage 12: Questions & Possession (Idafa) (10 lessons) ---
const stage12Items = [
  simpleItem('Man: who', 'Learn the question word "who".', 'مَن ذَا الَّذِي', 'who is the one who', 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', "Man dha lladhi"),
  simpleItem('Ma: what', 'Learn the question word "what".', 'وَمَا أَدْرَاكَ', 'and what will make you know', 'used to introduce important surahs, e.g. Al-Qadr 97:2', 'Wa ma adraka'),
  simpleItem('Ayna: where', 'Learn the question word "where".', 'أَيْنَ مَا', 'wherever', 'Surah An-Nisa 4:78', 'Ayna ma'),
  simpleItem('Mata: when', 'Learn the question word "when".', 'مَتَى', 'when', 'used throughout the Quran to ask about the Hour', 'Mata'),
  simpleItem('Kayfa: how', 'Learn the question word "how".', 'كَيْفَ', 'how', 'Surah Al-Ghashiyah 88:17, "do they not look at the camels, how they were created"', 'Kayfa'),
  simpleItem('Hal: yes/no questions', 'Learn how "hal" introduces a yes/no question.', 'هَلْ أَتَاكَ', 'has there come to you', 'Surah Al-Ghashiyah 88:1', 'Hal ataka'),
  simpleItem('Idafa review: Lord of the Worlds', 'Practice the Idafa construction again in a new phrase.', 'مَالِكِ يَوْمِ الدِّين', 'Master of the Day of Judgement', 'Surah Al-Fatihah 1:4', "Maliki yawmi d-din"),
  simpleItem('Idafa review: Day of Judgement', 'See "day" + "judgement" linked as an Idafa.', 'يَوْمِ الدِّين', 'the Day of Judgement', 'Surah Al-Fatihah 1:4', "Yawmi d-din"),
  simpleItem('Combining questions & Idafa', 'Practice asking "whose" using question words and Idafa together.', 'لِمَنِ الْمُلْك', 'to whom belongs the dominion', 'Surah Ghafir 40:16', "Limani l-mulk"),
  simpleItem('Stage 12 review: questions', 'Review all the question words learned in this stage.', 'مَا شَأْنُكُم', 'what is your affair', 'a common Quranic question construction', "Ma sha'nukum"),
];

// --- Stage 13: Pronouns & Past Tense Verbs (10 lessons) ---
const stage13Items = [
  simpleItem('Huwa: he', 'Learn the pronoun "he".', 'قُلْ هُوَ اللَّهُ أَحَد', 'Say: He is Allah, One', 'Surah Al-Ikhlas 112:1', 'Qul huwa Allahu ahad'),
  simpleItem('Hiya: she', 'Learn the pronoun "she".', 'هِيَ', 'she', 'used throughout the Quran', 'Hiya'),
  simpleItem('Nahnu: we', 'Learn the pronoun "we", often used for Allah’s majesty.', 'إِنَّا نَحْنُ نَزَّلْنَا', 'indeed it is We who sent it down', 'Surah Al-Hijr 15:9', 'Inna nahnu nazzalna'),
  simpleItem('Ana: I', 'Learn the pronoun "I".', 'إِنَّنِي أَنَا اللَّه', 'indeed, I am Allah', 'Surah Taha 20:14', 'Innani ana Allah'),
  simpleItem('Past tense: Kataba (wrote)', 'Learn the past-tense root for "to write".', 'كَتَبَ', 'he wrote', 'used throughout the Quran', 'Kataba'),
  simpleItem('Past tense: Dhahaba (went)', 'Learn the past-tense root for "to go".', 'ذَهَبَ', 'he went', 'Surah Yusuf 12:17', 'Dhahaba'),
  simpleItem('Past tense: Qara’a (read)', 'Learn the past-tense root for "to read/recite".', 'قَرَأَ', 'he read/recited', 'related to the word Quran itself', "Qara'a"),
  simpleItem('Past tense: Khalaqa (created)', 'Learn the past-tense verb "he created".', 'خَلَقَ السَّمَاوَاتِ', 'He created the heavens', 'Surah Al-Anbya 21:30', 'Khalaqa s-samawat'),
  simpleItem('Past tense conjugation: I/we', 'Learn how the verb ending changes for "I" and "we".', 'خَلَقْنَا', 'We created', 'Surah Al-Insan 76:2', 'Khalaqna'),
  simpleItem('Stage 13 review: pronouns & verbs', 'Review pronouns and past-tense verbs together.', 'إِيَّاكَ نَعْبُدُ', 'You alone we worship', 'Surah Al-Fatihah 1:5', "Iyyaka na'budu"),
];

// --- Stage 14: Present Tense & Plurals (10 lessons) ---
const stage14Items = [
  simpleItem('Present tense: Ya‘lamu (he knows)', 'Learn the present-tense prefix ya-.', 'يَعْلَمُ', 'he knows', 'Surah Al-Hadid 57:4', "Ya'lamu"),
  simpleItem('Present tense: Yarzuqu (He provides)', 'See another present-tense verb describing Allah.', 'يَرْزُقُ', 'He provides', 'used throughout the Quran', 'Yarzuqu'),
  simpleItem('Present tense: Na‘budu (we worship)', 'Learn the present-tense prefix na-.', 'نَعْبُدُ', 'we worship', 'Surah Al-Fatihah 1:5', "Na'budu"),
  simpleItem('Present tense: Nasta‘een (we ask for help)', 'See the present tense used again in Al-Fatihah.', 'نَسْتَعِينُ', 'we ask for help', 'Surah Al-Fatihah 1:5', "Nasta'in"),
  simpleItem('The imperative: Read!', 'Learn the command form, the very first Quranic revelation.', 'اقْرَأْ', 'Read!', 'Surah Al-Alaq 96:1', "Iqra'"),
  simpleItem('Broken plural: Prophets', 'See a broken (irregular) plural in practice.', 'أَنْبِيَاء', 'prophets (plural)', 'Surah An-Nisa 4:69', "Anbiya'"),
  simpleItem('Broken plural: Worlds', 'See another broken plural pattern.', 'عَالَمِين', 'worlds (plural)', 'Surah Al-Fatihah 1:2', 'Alamin'),
  simpleItem('Negation: La (no)', 'Learn how "la" negates a present-tense verb.', 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْم', 'neither drowsiness nor sleep overtakes Him', 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', 'La ta’khudhuhu sinatun wa la nawm'),
  simpleItem('Negation: Lam (did not)', 'Learn how "lam" negates a verb in the past.', 'لَمْ يَلِدْ وَلَمْ يُولَد', 'He neither begets nor is born', 'Surah Al-Ikhlas 112:3', 'Lam yalid wa lam yulad'),
  simpleItem('Stage 14 review: present tense', 'Review present-tense verbs, plurals, and negation.', 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَد', 'nor is there to Him any equivalent', 'Surah Al-Ikhlas 112:4', 'Wa lam yakun lahu kufuwan ahad'),
];

// --- Stage 15: Complex Sentences & Quranic Patterns (10 lessons, reading Al-Fatihah in full) ---
const readingItem = (title, arabicWord, meaning, reference, transliteration) =>
  simpleItem(title, `Read ${title} word by word and understand its meaning.`, arabicWord, meaning, reference, transliteration, {
    type: 'reading',
    concept: 'Read the verse below word by word, then check your understanding.',
  });
const stage15Items = [
  readingItem('Al-Fatihah, Ayah 1', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:1', 'Bismillahi r-Rahmani r-Rahim'),
  readingItem('Al-Fatihah, Ayah 2', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'All praise is due to Allah, Lord of the worlds.', 'Surah Al-Fatihah 1:2', 'Alhamdulillahi Rabbi l-alamin'),
  readingItem('Al-Fatihah, Ayah 3', 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:3', 'Ar-Rahmani r-Rahim'),
  readingItem('Al-Fatihah, Ayah 4', 'مَالِكِ يَوْمِ الدِّينِ', 'Master of the Day of Judgement.', 'Surah Al-Fatihah 1:4', 'Maliki yawmi d-din'),
  readingItem('Al-Fatihah, Ayah 5', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'You alone we worship, and You alone we ask for help.', 'Surah Al-Fatihah 1:5', "Iyyaka na'budu wa iyyaka nasta'in"),
  readingItem('Al-Fatihah, Ayah 6', 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path.', 'Surah Al-Fatihah 1:6', 'Ihdina s-sirata l-mustaqim'),
  readingItem('Al-Fatihah, Ayah 7', 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', 'The path of those You have blessed.', 'Surah Al-Fatihah 1:7', 'Sirata lladhina an’amta alayhim'),
  simpleItem('Conditional: In (if)', 'Learn how "in" introduces a possible condition.', 'إِن تَعُدُّوا', 'if you count', 'Surah Ibrahim 14:34', "In ta'uddu"),
  simpleItem('Conditional: Law (if, hypothetical)', 'Learn how "law" introduces a hypothetical condition.', 'لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّه', 'if there were gods besides Allah', 'Surah Al-Anbya 21:22', 'Law kana fihima alihatun illallah'),
  simpleItem('Stage 15 review: Al-Fatihah', 'Review all seven ayahs of Al-Fatihah together.', 'وَلَا الضَّالِّين', 'nor of those who are astray', 'Surah Al-Fatihah 1:7', 'Wa la d-dallin'),
];

// --- Stage 16: Fluency & Quranic Application (Capstone) (10 lessons) ---
const stage16Items = [
  readingItem('Al-Ikhlas, Ayah 1-2', 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ', 'Say: He is Allah, One. Allah, the Eternal Refuge.', 'Surah Al-Ikhlas 112:1-2', 'Qul huwa Allahu ahad, Allahu s-samad'),
  readingItem('Al-Ikhlas, Ayah 3-4', 'لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', 'He neither begets nor is born, nor is there any equivalent to Him.', 'Surah Al-Ikhlas 112:3-4', 'Lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad'),
  readingItem('An-Nas, Ayah 1', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Say: I seek refuge in the Lord of mankind.', 'Surah An-Nas 114:1', "Qul a'udhu bi Rabbi n-nas"),
  readingItem('Al-Falaq, Ayah 1', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Say: I seek refuge in the Lord of the daybreak.', 'Surah Al-Falaq 113:1', "Qul a'udhu bi Rabbi l-falaq"),
  simpleItem('The root system: K-T-B', 'See how kataba (wrote), kitab (book), and maktabah (library) share one root.', 'مَكْتَبَة', 'library', 'built on the same root as kitab (book) and kataba (wrote)', 'Maktabah'),
  simpleItem('The root system: A-L-M', 'See how ‘ilm (knowledge) and ‘alim (scholar) share one root.', 'عَالِم', 'scholar', 'Surah Fatir 35:28, "only those of knowledge fear Allah among His servants"', 'Alim'),
  simpleItem('Classical vs Modern Arabic', 'Understand that the Quran preserved Classical Arabic for 1400+ years.', 'فُصْحَى', 'classical/formal Arabic', 'the register in which the Quran was revealed', 'Fusha'),
  simpleItem('Tajweed terms: Makki & Madani', 'Learn how surahs are classified by where they were revealed.', 'مَكِّيَّة', 'Meccan (revealed in Makkah)', 'a classification used for every surah of the Quran', 'Makkiyyah'),
  simpleItem('Reading comprehension', 'Apply everything learned to a short new passage.', 'وَالْعَصْرِ', 'By time', 'Surah Al-Asr 103:1', 'Wal-Asr'),
  simpleItem('Capstone: Your Arabic & Quran Journey', 'Celebrate finishing the full 16-stage ArabiKids journey.', 'رَبِّ زِدْنِي عِلْمًا', 'My Lord, increase me in knowledge', 'Surah Taha 20:114', 'Rabbi zidni ilma', { type: 'capstone', concept: 'You’ve learned letters, harakat, vocabulary, grammar, and now you can read real Quranic verses. This dua asks Allah for even more knowledge as your journey continues.' }),
];

// ---------------------------------------------------------------------------
// ASSEMBLE
// ---------------------------------------------------------------------------

export const STAGE_ITEMS = {
  stage1: stage1Items,
  stage2: stage2Items,
  stage3: stage3Items,
  stage4: stage4Items,
  stage5: stage5Items,
  stage6: stage6Items,
  stage7: stage7Items,
  stage8: stage8Items,
  stage9: stage9Items,
  stage10: stage10Items,
  stage11: stage11Items,
  stage12: stage12Items,
  stage13: stage13Items,
  stage14: stage14Items,
  stage15: stage15Items,
  stage16: stage16Items,
};

// ---------------------------------------------------------------------------
// PLACEMENT TEST — one diagnostic question per stage, testing the core skill
// that stage teaches. The test bisects over these (see list_placement_
// questions() RPC / frontend/src/lib/db.js runPlacementTest) rather than
// asking all 16 in order.
// ---------------------------------------------------------------------------

const PLACEMENT_QUESTIONS = {
  stage1: {
    instruction: 'Which of these is the Arabic letter "alif"?',
    options: ['ا', 'ب', 'ت', 'ث'],
    correct_answer: 'ا',
  },
  stage2: {
    instruction: 'What sound does the mark  ِ  (kasra) make under a letter?',
    options: ['a short "i" sound', 'a short "a" sound', 'a short "u" sound', 'no sound at all'],
    correct_answer: 'a short "i" sound',
  },
  stage3: {
    instruction: 'Which harakah (vowel mark) makes a short "u" sound?',
    options: ['Damma (ُ)', 'Fatha (َ)', 'Kasra (ِ)', 'Sukoon (ْ)'],
    correct_answer: 'Damma (ُ)',
  },
  stage4: {
    instruction: 'What does a sukoon (ْ) over a letter mean?',
    options: ['the letter has no vowel sound', 'the letter is doubled', 'the vowel is lengthened', 'the letter is silent (dropped)'],
    correct_answer: 'the letter has no vowel sound',
  },
  stage5: {
    instruction: 'When Arabic letters connect to form a word, what usually changes?',
    options: ['their shape', 'their meaning', 'their sound', 'nothing changes'],
    correct_answer: 'their shape',
  },
  stage6: {
    instruction: 'Which of these is a complete 3-letter word, not just a single letter?',
    options: ['بَيْت', 'ب', 'ت', 'ك'],
    correct_answer: 'بَيْت',
  },
  stage7: {
    instruction: 'What does the word "سَلَام" mean?',
    options: ['peace', 'book', 'light', 'religion'],
    correct_answer: 'peace',
  },
  stage8: {
    instruction: 'What does the phrase "بِسْمِ اللَّه" mean?',
    options: ['In the name of Allah', 'Praise be to Allah', 'Allah is Greatest', 'There is no god but Allah'],
    correct_answer: 'In the name of Allah',
  },
  stage9: {
    instruction: 'Which ending typically marks a feminine noun in Arabic (e.g. مُعَلِّمَة)?',
    options: ['ة  (taa marbuta)', 'ون', 'ين', 'ات'],
    correct_answer: 'ة  (taa marbuta)',
  },
  stage10: {
    instruction: 'What does the prefix "ال" (al-) do to an Arabic noun?',
    options: ['makes it definite ("the")', 'makes it plural', 'makes it feminine', 'turns it into a question'],
    correct_answer: 'makes it definite ("the")',
  },
  stage11: {
    instruction: 'What does the preposition "فِي" mean?',
    options: ['in', 'on', 'with', 'from'],
    correct_answer: 'in',
  },
  stage12: {
    instruction: 'In an Idafa (possessive) phrase like "كِتَابُ اللهِ", what does it mean?',
    options: ['The book of Allah', 'A book about Allah', 'Books and Allah', "Allah's books"],
    correct_answer: 'The book of Allah',
  },
  stage13: {
    instruction: 'The verb ending "تُ" (as in كَتَبْتُ) tells you the subject is:',
    options: ['I (past tense)', 'you (past tense)', 'she (past tense)', 'they (past tense)'],
    correct_answer: 'I (past tense)',
  },
  stage14: {
    instruction: 'The prefix "يَ" at the start of a verb (e.g. يَكْتُبُ) tells you it is:',
    options: ['present tense, he/it', 'present tense, I', 'past tense, they', 'present tense, we'],
    correct_answer: 'present tense, he/it',
  },
  stage15: {
    instruction: 'In "إِيَّاكَ نَعْبُدُ" (You alone we worship), what does "نَعْبُدُ" mean?',
    options: ['we worship', 'you worship', 'he worships', 'they worship'],
    correct_answer: 'we worship',
  },
  stage16: {
    instruction: 'Which surah is traditionally recited in every unit (rakah) of the five daily prayers?',
    options: ['Al-Fatihah', 'Al-Ikhlas', 'An-Nas', 'Al-Kawthar'],
    correct_answer: 'Al-Fatihah',
  },
};

async function seed() {
  console.log('Clearing existing v2 data...');
  await supabase.from('placement_results').delete().neq('id', 0);
  await supabase.from('placement_questions').delete().neq('id', 0);
  await supabase.from('child_badges').delete().neq('id', 0);
  await supabase.from('child_stage_progress').delete().neq('id', 0);
  await supabase.from('child_lesson_progress').delete().neq('id', 0);
  await supabase.from('exercise_questions').delete().neq('id', 0);
  await supabase.from('stage_exercises').delete().neq('id', 0);
  await supabase.from('lessons').delete().neq('id', 0);
  await supabase.from('stages').delete().neq('id', 0);
  await supabase.from('levels').delete().neq('id', 0);

  console.log('Seeding levels...');
  const levelIdByKey = {};
  for (const level of LEVELS) {
    const { data, error } = await supabase
      .from('levels')
      .insert({ name: level.name, order_index: level.order_index, description: level.description })
      .select('id')
      .single();
    if (error) throw new Error(`Failed to insert level ${level.name}: ${error.message}`);
    levelIdByKey[level.key] = data.id;
  }

  console.log('Seeding stages...');
  const stageIdByKey = {};
  for (const stage of STAGES) {
    const { data, error } = await supabase
      .from('stages')
      .insert({
        level_id: levelIdByKey[stage.levelKey],
        name: stage.name,
        order_index: stage.order_index,
        min_placement_age: stage.min_placement_age,
        is_free: stage.is_free,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Failed to insert stage ${stage.name}: ${error.message}`);
    stageIdByKey[stage.key] = data.id;
  }

  console.log('Seeding placement test questions...');
  for (const stage of STAGES) {
    const q = PLACEMENT_QUESTIONS[stage.key];
    const { error } = await supabase.from('placement_questions').insert({
      stage_id: stageIdByKey[stage.key],
      instruction: q.instruction,
      options: q.options,
      correct_answer: q.correct_answer,
    });
    if (error) throw new Error(`Failed to insert placement question for ${stage.name}: ${error.message}`);
  }

  console.log('Seeding lessons + stage checkpoints...');
  let totalLessons = 0;
  let totalCheckpoints = 0;
  for (const stage of STAGES) {
    const items = STAGE_ITEMS[stage.key];
    const stageId = stageIdByKey[stage.key];
    const lessons = buildLessons(stage.key, items).map((l) => ({
      stage_id: stageId,
      order_index: l.order_index,
      title: l.title,
      lesson_goal: l.lesson_goal,
      arabic_word: l.arabic_word,
      arabic_word_meaning: l.arabic_word_meaning,
      content: l.content,
      is_free: stage.is_free,
      estimated_minutes: l.estimated_minutes,
    }));

    const { error: lessonsError } = await supabase.from('lessons').insert(lessons);
    if (lessonsError) throw new Error(`Failed to insert lessons for ${stage.name}: ${lessonsError.message}`);
    totalLessons += lessons.length;

    const checkpoints = buildStageCheckpoints(items);
    for (const cp of checkpoints) {
      const { data: seRow, error: seError } = await supabase
        .from('stage_exercises')
        .insert({ stage_id: stageId, checkpoint_order: cp.checkpoint_order, is_mastery: cp.is_mastery })
        .select('id')
        .single();
      if (seError) throw new Error(`Failed to insert checkpoint for ${stage.name}: ${seError.message}`);

      const questionRows = cp.questions.map((q) => ({
        stage_exercise_id: seRow.id,
        question_number: q.question_number,
        title: q.title,
        instruction: q.instruction,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      }));
      const { error: qError } = await supabase.from('exercise_questions').insert(questionRows);
      if (qError) throw new Error(`Failed to insert questions for ${stage.name} checkpoint ${cp.checkpoint_order}: ${qError.message}`);
      totalCheckpoints += 1;
    }
  }

  console.log(`Seed complete: ${LEVELS.length} levels, ${STAGES.length} stages, ${totalLessons} lessons, ${totalCheckpoints} checkpoints, ${STAGES.length} placement questions.`);

  console.log('Seeding admin user (email: admin@arabikids.com / password: Admin123!)...');
  const ADMIN_EMAIL = 'admin@arabikids.com';
  const ADMIN_PASSWORD = 'Admin123!';

  let adminUserId;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'ArabiKids Admin' },
  });

  if (createError) {
    if (!createError.message.includes('already been registered')) {
      throw new Error(`Failed to create admin user: ${createError.message}`);
    }
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Failed to look up existing admin user: ${listError.message}`);
    const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
    if (!existing) throw new Error('Admin user reported as existing but could not be found.');
    adminUserId = existing.id;
  } else {
    adminUserId = created.user.id;
  }

  const { error: promoteError } = await supabase
    .from('users')
    .update({ role: 'admin', subscription_status: 'active', subscription_tier: 'family' })
    .eq('id', adminUserId);

  if (promoteError) {
    throw new Error(`Failed to promote admin user: ${promoteError.message}`);
  }

  console.log('Admin user ready.');
}

// Only auto-run when executed directly (`node supabase/seed.mjs`) - guarded
// so other scripts can safely `import { STAGE_ITEMS, STAGES } from
// './seed.mjs'` to reuse this content without triggering the full
// destructive reseed (which drops/rebuilds most tables). Uses pathToFileURL
// rather than manual string surgery - Windows file:// URLs need a third
// slash before the drive letter (file:///C:/...) that naive concatenation
// misses, which would have silently made `node supabase/seed.mjs` a no-op.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
