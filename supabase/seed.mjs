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
  ['فَتْحَة (Fatha)', 'a short "a" sound, as in the بَ of تَبَارَكَ', 'بَ', 'the "ba" sound', 'Surah Al-Mulk 67:1', 'Ba', { surah: 67, ayah: 1, surahName: 'Al-Mulk' }],
  ['كَسْرَة (Kasra)', 'a short "i" sound, as in the بِ of بِسْمِ', 'بِ', 'the "bi" sound', 'Surah Al-Fatihah 1:1', 'Bi', { surah: 1, ayah: 1, surahName: 'Al-Fatihah' }],
  ['ضَمَّة (Damma)', 'a short "u" sound, as in the هُ of هُدَى', 'هُ', 'the "hu" sound', 'Surah Al-Fatihah 1:6', 'Hu', { surah: 1, ayah: 6, surahName: 'Al-Fatihah' }],
  ['تَنْوِين (Tanween)', 'a doubled ending sound, as in سَلَامٌ', 'سَلَامٌ', 'peace (indefinite)', 'Surah Al-Qadr 97:5', 'Salamun', { surah: 97, ayah: 5, surahName: 'Al-Qadr' }],
  ['شَدَّة وسُكُون (Shaddah & Sukoon)', 'a doubled letter and a silent letter, as in اللّٰه', 'اللّٰه', 'Allah', 'used throughout the Quran', 'Allah', null],
];

// Real, single-ayah citations for the letters whose `reference` string above
// is an actual verse (not a generic phrase like "a name of Allah" or "often
// refers to the Quran", which have no one ayah to cite) - keyed by letter so
// letterPairItem can attach it without changing the LETTERS tuple shape.
// Powers the real reciter-audio button (frontend/src/lib/quranAudio.js).
const LETTER_QURAN_REF = {
  'ب': { surah: 1, ayah: 1, surahName: 'Al-Fatihah' },
  'ت': { surah: 67, ayah: 1, surahName: 'Al-Mulk' },
  'ح': { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  'د': { surah: 1, ayah: 4, surahName: 'Al-Fatihah' },
  'ر': { surah: 1, ayah: 3, surahName: 'Al-Fatihah' },
  'ص': { surah: 1, ayah: 6, surahName: 'Al-Fatihah' },
  'ض': { surah: 93, ayah: 1, surahName: 'Ad-Duha' },
  'ط': { surah: 20, ayah: 1, surahName: 'Taha' },
  'ع': { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  'م': { surah: 1, ayah: 4, surahName: 'Al-Fatihah' },
  'ن': { surah: 24, ayah: 35, surahName: 'An-Nur' },
  'ه': { surah: 1, ayah: 6, surahName: 'Al-Fatihah' },
  'ي': { surah: 1, ayah: 4, surahName: 'Al-Fatihah' },
};

// Position-form word anchors (spec 4a step 2-3): for each letter, a real
// Quranic word showing it in each shape it can actually take. The 6
// non-connecting letters (ا د ذ ر ز و) never take an initial/medial shape -
// they can only follow a connection, never pass one on - so they only get a
// 'final' entry here (their isolated form is already the single word/audio
// already curated per letter above). Every entry below was checked
// programmatically against real Arabic joining rules (which letter connects
// to which, letter-by-letter within each word) before being accepted, not
// hand-guessed - see the position-derivation note in CLAUDE.md history if
// this table ever needs regenerating.
export const LETTER_POSITIONS = {
  'ا': {
    final: { word: 'تَبَارَكَ', meaning: 'blessed is He', reference: 'Surah Al-Mulk 67:1', transliteration: 'Tabaraka' },
  },
  'ب': {
    initial: { word: 'بِسْمِ', meaning: 'in the name of', reference: 'Surah Al-Fatihah 1:1', transliteration: 'Bismi' },
    medial: { word: 'تَبَارَكَ', meaning: 'blessed is He', reference: 'Surah Al-Mulk 67:1', transliteration: 'Tabaraka' },
    final: { word: 'أَب', meaning: 'father', reference: 'Surah Yusuf 12:4, Yusuf speaking to his father', transliteration: 'Ab' },
  },
  'ت': {
    initial: { word: 'تَبَارَكَ', meaning: 'blessed is He', reference: 'Surah Al-Mulk 67:1', transliteration: 'Tabaraka' },
    medial: { word: 'كِتَاب', meaning: 'book', reference: 'often refers to the Quran', transliteration: 'Kitab' },
    final: { word: 'بَيْت', meaning: 'house', reference: 'Surah Al-Baqarah 2:125', transliteration: 'Bayt' },
  },
  'ث': {
    initial: { word: 'ثَبَات', meaning: 'steadfastness', reference: 'a quality asked for in dua', transliteration: 'Thabat' },
    medial: { word: 'كَثِير', meaning: 'much / many', reference: 'Surah Al-Baqarah 2:26', transliteration: 'Katheer' },
    final: { word: 'حَدِيث', meaning: 'narration / speech', reference: 'Surah An-Nisa 4:87', transliteration: 'Hadeeth' },
  },
  'ج': {
    initial: { word: 'جَنَّة', meaning: 'Paradise', reference: 'mentioned throughout the Quran', transliteration: 'Jannah' },
    medial: { word: 'مَسْجِد', meaning: 'mosque', reference: 'Surah Al-Baqarah 2:144', transliteration: 'Masjid' },
    final: { word: 'حَجّ', meaning: 'pilgrimage', reference: 'Surah Al-Baqarah 2:196', transliteration: 'Hajj' },
  },
  'ح': {
    initial: { word: 'حَمْد', meaning: 'praise', reference: 'Surah Al-Fatihah 1:2', transliteration: 'Hamd' },
    medial: { word: 'ضُحَى', meaning: 'morning brightness', reference: 'Surah Ad-Duha 93:1', transliteration: 'Duha' },
    final: { word: 'فَتْح', meaning: 'victory / opening', reference: 'Surah Al-Fath 48:1', transliteration: 'Fath' },
  },
  'خ': {
    initial: { word: 'خَالِق', meaning: 'the Creator', reference: 'a name of Allah', transliteration: 'Khaliq' },
    medial: { word: 'أَخْضَر', meaning: 'green', reference: 'Surah Al-Insan 76:21, the green garments of Paradise', transliteration: 'Akhdar' },
    final: { word: 'أَخ', meaning: 'brother', reference: 'Surah Yusuf 12:8, the brothers of Yusuf', transliteration: 'Akh' },
  },
  'د': {
    final: { word: 'حَمْد', meaning: 'praise', reference: 'Surah Al-Fatihah 1:2', transliteration: 'Hamd' },
  },
  'ذ': {
    final: { word: 'هَٰذِهِ', meaning: 'this (feminine)', reference: 'used throughout the Quran', transliteration: 'Hadhihi' },
  },
  'ر': {
    final: { word: 'ذِكْر', meaning: 'remembrance', reference: 'remembrance of Allah', transliteration: 'Dhikr' },
  },
  'ز': {
    final: { word: 'إِنَّا نَحْنُ نَزَّلْنَا', meaning: 'indeed it is We who sent it down', reference: 'Surah Al-Hijr 15:9', transliteration: 'Inna nahnu nazzalna' },
  },
  'س': {
    initial: { word: 'سَلَام', meaning: 'peace', reference: 'a name of Allah and Islamic greeting', transliteration: 'Salam' },
    medial: { word: 'بِسْمِ', meaning: 'in the name of', reference: 'Surah Al-Fatihah 1:1', transliteration: 'Bismi' },
    final: { word: 'شَمْس', meaning: 'sun', reference: 'Surah Ash-Shams 91:1', transliteration: 'Shams' },
  },
  'ش': {
    initial: { word: 'شُكْر', meaning: 'gratitude', reference: 'being thankful to Allah', transliteration: 'Shukr' },
    medial: { word: 'عَشْر', meaning: 'ten', reference: 'Surah Al-Fajr 89:2, "by the ten nights"', transliteration: 'Ashr' },
    final: { word: 'بَطْش', meaning: 'forceful seizure', reference: 'Surah Ad-Dukhan 44:16', transliteration: 'Batsh' },
  },
  'ص': {
    initial: { word: 'صِرَاط', meaning: 'the path', reference: 'Surah Al-Fatihah 1:6', transliteration: 'Sirat' },
    medial: { word: 'أَصْفَر', meaning: 'yellow', reference: 'Surah Al-Baqarah 2:69, describing a bright yellow cow', transliteration: 'Asfar' },
    final: { word: 'قَصَص', meaning: 'stories / narratives', reference: 'Surah Yusuf 12:3', transliteration: 'Qasas' },
  },
  'ض': {
    initial: { word: 'ضُحَى', meaning: 'morning brightness', reference: 'Surah Ad-Duha 93:1', transliteration: 'Duha' },
    medial: { word: 'أَخْضَر', meaning: 'green', reference: 'Surah Al-Insan 76:21, the green garments of Paradise', transliteration: 'Akhdar' },
    final: { word: 'أَبْيَض', meaning: 'white', reference: 'Surah Fatir 35:27, describing white mountain streaks', transliteration: 'Abyad' },
  },
  'ط': {
    initial: { word: 'طه', meaning: 'Taha', reference: 'opening letters of Surah Taha 20:1', transliteration: 'Taha' },
    medial: { word: 'لُطْف', meaning: 'gentleness', reference: 'a quality of Allah', transliteration: 'Lutf' },
    final: { word: 'قِسْط', meaning: 'justice / fairness', reference: "Surah Ali 'Imran 3:18", transliteration: 'Qist' },
  },
  'ظ': {
    initial: { word: 'ظُلْم', meaning: 'wrongdoing', reference: 'what Allah warns against', transliteration: 'Dhulm' },
    medial: { word: 'عَظِيم', meaning: 'great / mighty', reference: 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', transliteration: 'Azeem' },
    final: { word: 'حِفْظ', meaning: 'protection / preservation', reference: 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', transliteration: 'Hifz' },
  },
  'ع': {
    initial: { word: 'عَالَمِين', meaning: 'all the worlds', reference: 'Surah Al-Fatihah 1:2', transliteration: 'Aalameen' },
    medial: { word: 'يَعْلَمُ', meaning: 'he knows', reference: 'Surah Al-Hadid 57:4', transliteration: "Ya'lamu" },
    final: { word: 'سَبْع', meaning: 'seven', reference: 'Surah Al-Hijr 15:87, "the seven oft-repeated verses"', transliteration: "Sab'" },
  },
  'غ': {
    initial: { word: 'غَفُور', meaning: 'Most Forgiving', reference: 'a name of Allah', transliteration: 'Ghafoor' },
    medial: { word: 'أَسْتَغْفِرُ اللَّه', meaning: 'I seek Allah’s forgiveness', reference: 'a phrase rooted in the Quran’s calls to seek forgiveness', transliteration: 'Astaghfirullah' },
    final: { word: 'بَلَغ', meaning: 'he reached / attained', reference: 'Surah Al-Kahf 18:76', transliteration: 'Balagha' },
  },
  'ف': {
    initial: { word: 'فَاتِحَة', meaning: 'the opening', reference: 'the first surah of the Quran', transliteration: 'Fatihah' },
    medial: { word: 'غَفُور', meaning: 'Most Forgiving', reference: 'a name of Allah', transliteration: 'Ghafoor' },
    final: { word: 'لُطْف', meaning: 'gentleness', reference: 'a quality of Allah', transliteration: 'Lutf' },
  },
  'ق': {
    initial: { word: 'قُرْآن', meaning: 'the recitation', reference: 'the final revelation', transliteration: 'Quran' },
    medial: { word: 'الْقَمَر', meaning: 'the moon', reference: 'Surah Al-Qamar 54:1', transliteration: 'Al-Qamar' },
    final: { word: 'خَالِق', meaning: 'the Creator', reference: 'a name of Allah', transliteration: 'Khaliq' },
  },
  'ك': {
    initial: { word: 'ذِكْر', meaning: 'remembrance', reference: 'remembrance of Allah', transliteration: 'Dhikr' },
    medial: { word: 'شُكْر', meaning: 'gratitude', reference: 'being thankful to Allah', transliteration: 'Shukr' },
    final: { word: 'مَلِك', meaning: 'King / Sovereign', reference: 'Surah Al-Fatihah 1:4', transliteration: 'Malik' },
  },
  'ل': {
    initial: { word: 'اللّٰه', meaning: 'Allah', reference: 'used throughout the Quran', transliteration: 'Allah' },
    medial: { word: 'اللّٰه', meaning: 'Allah', reference: 'used throughout the Quran', transliteration: 'Allah' },
    final: { word: 'لَيْل', meaning: 'night', reference: 'Surah Al-Layl 91:1', transliteration: 'Layl' },
  },
  'م': {
    initial: { word: 'مَلِك', meaning: 'King / Sovereign', reference: 'Surah Al-Fatihah 1:4', transliteration: 'Malik' },
    medial: { word: 'حَمْد', meaning: 'praise', reference: 'Surah Al-Fatihah 1:2', transliteration: 'Hamd' },
    final: { word: 'بِسْمِ', meaning: 'in the name of', reference: 'Surah Al-Fatihah 1:1', transliteration: 'Bismi' },
  },
  'ن': {
    initial: { word: 'نُور', meaning: 'light', reference: 'Surah An-Nur 24:35', transliteration: 'Nur' },
    medial: { word: 'جَنَّة', meaning: 'Paradise', reference: 'mentioned throughout the Quran', transliteration: 'Jannah' },
    final: { word: 'دِين', meaning: 'religion / way of life', reference: 'Surah Al-Fatihah 1:4', transliteration: 'Deen' },
  },
  'ه': {
    initial: { word: 'هُدَى', meaning: 'guidance', reference: 'Surah Al-Fatihah 1:6', transliteration: 'Huda' },
    medial: { word: 'عَلَيْهِم', meaning: 'upon them', reference: 'used throughout the Quran', transliteration: 'Alayhim' },
    final: { word: 'اللّٰه', meaning: 'Allah', reference: 'used throughout the Quran', transliteration: 'Allah' },
  },
  'و': {
    final: { word: 'غَفُور', meaning: 'Most Forgiving', reference: 'a name of Allah', transliteration: 'Ghafoor' },
  },
  'ي': {
    initial: { word: 'دِين', meaning: 'religion / way of life', reference: 'Surah Al-Fatihah 1:4', transliteration: 'Deen' },
    medial: { word: 'عَالَمِين', meaning: 'all the worlds', reference: 'Surah Al-Fatihah 1:2', transliteration: 'Aalameen' },
    final: { word: 'نَبِيّ', meaning: 'Prophet', reference: 'used throughout the Quran for Allah’s messengers', transliteration: 'Nabi' },
  },
};

// Non-connecting letters can only ever render isolated or final - they
// receive a connection from a preceding letter but never pass one forward.
export const NON_CONNECTING_LETTERS = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);

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
export function buildStageCheckpoints(items) {
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

// Bare consonant sound per letter, used to build a short-vs-long madd
// comparison (letter+fatha vs letter+fatha+alif) for every letter-pair
// lesson - so the short/long vowel-length distinction is introduced as
// early as Stage 1, not only in Stage 5's dedicated madd lessons. Alif has
// no consonant sound of its own, so it's excluded (no maddPair for it).
const LETTER_ROMAN = {
  'ب': 'B', 'ت': 'T', 'ث': 'Th', 'ج': 'J', 'ح': 'H', 'خ': 'Kh',
  'د': 'D', 'ذ': 'Dh', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'Sh',
  'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': "'", 'غ': 'Gh',
  'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
  'ه': 'H', 'و': 'W', 'ي': 'Y',
};
const FATHA = 'َ';
const KASRA = 'ِ';
const DAMMA = 'ُ';
const ALIF = 'ا';
function maddPairFor(letter) {
  const roman = LETTER_ROMAN[letter];
  if (!roman) return null;
  return {
    short: { arabic: letter + FATHA, transliteration: `${roman}a`, label: 'Short (1 count)' },
    long: { arabic: letter + FATHA + ALIF, transliteration: `${roman}aa`, label: 'Long (2 counts) - alif madd' },
  };
}

// The three basic short-vowel harakat (fatha/kasra/damma - "ba/bi/bu") per
// letter, introduced right in Stage 1's letter-pair lessons rather than only
// as Stage 2-3's separate dedicated harakat lessons - so a kid meets the
// full "ba be boo" sound set for a letter as soon as they meet the letter.
function harakatSetFor(letter) {
  const roman = LETTER_ROMAN[letter];
  if (!roman) return null;
  return {
    fatha: { arabic: letter + FATHA, transliteration: `${roman}a`, label: 'Fatha' },
    kasra: { arabic: letter + KASRA, transliteration: `${roman}i`, label: 'Kasra' },
    damma: { arabic: letter + DAMMA, transliteration: `${roman}u`, label: 'Damma' },
  };
}

// Shown instead of a blank/missing Vowel Sounds section for the one letter
// with no harakatSet (alif has no consonant sound of its own, so fatha/
// kasra/damma don't apply to it the way they do to every other letter) - a
// beginner meeting Arabic for the first time should never see a letter
// silently skipped without explanation.
const HARAKAT_NOTE_BY_LETTER = {
  'ا': "Alif doesn't take fatha/kasra/damma the way other letters do - on its own it's silent. Instead, it stretches the vowel sound of the letter BEFORE it into a long \"aaa\" (like in \"father\"). You'll meet this properly as madd in Stage 5.",
};
function harakatNoteFor(letter) {
  return HARAKAT_NOTE_BY_LETTER[letter] || null;
}

function letterPairItem([l1, n1, w1, m1, r1, t1], [l2, n2, w2, m2, r2, t2], { isFirstLesson = false } = {}) {
  const orientation = isFirstLesson
    ? 'Arabic is written and read from right to left - the opposite of English. Every letter can change shape slightly depending on whether it sits at the start, middle, or end of a word, but it always keeps the same sound. '
    : '';
  return {
    title: `Letters ${l1} & ${l2} (${n1}, ${n2})`,
    goal: `Recognise ${l1} and ${l2}, and meet them inside real Quranic words.`,
    arabicWord: w1,
    meaning: m1,
    reference: r1,
    transliteration: t1,
    type: 'letter-pair',
    concept:
      `${orientation}In this lesson you'll meet two letters: ${l1}, called "${n1}", and ${l2}, called "${n2}". ` +
      `Look at each one, listen to how it sounds, trace its shape, and then spot it inside a real word from the Quran below.`,
    extra: {
      letters: [
        { letter: l1, name: n1, positions: LETTER_POSITIONS[l1] || null, maddPair: maddPairFor(l1), harakatSet: harakatSetFor(l1), harakatNote: harakatNoteFor(l1) },
        { letter: l2, name: n2, positions: LETTER_POSITIONS[l2] || null, maddPair: maddPairFor(l2), harakatSet: harakatSetFor(l2), harakatNote: harakatNoteFor(l2) },
      ],
      secondWord: { arabic: w2, translation: m2, reference: r2, transliteration: t2 },
      quranRef: LETTER_QURAN_REF[l1] || null,
    },
  };
}

function harakatItem([title, desc, word, meaning, reference, transliteration, quranRef]) {
  return {
    title,
    goal: `Learn the ${title.split(' ')[0]} vowel mark and hear it in a Quranic word.`,
    arabicWord: word,
    meaning,
    reference,
    transliteration,
    type: 'harakat',
    concept: desc,
    extra: { quranRef: quranRef || null },
  };
}

function practiceItem([letter, , word, meaning, reference, transliteration], harakatLabel) {
  return {
    title: `Practice: ${harakatLabel} in "${word}"`,
    goal: `Spot the ${harakatLabel} mark inside a word you've already learned.`,
    arabicWord: word,
    meaning,
    reference,
    transliteration,
    type: 'harakat-practice',
    concept: `Look for the ${harakatLabel} mark in "${word}" ("${meaning}") and sound it out.`,
    extra: { quranRef: LETTER_QURAN_REF[letter] || null },
  };
}

// One lesson teaching all 3 tanween forms together (Stage 4), instead of
// treating tanween as just another single harakat mark.
function tanweenItem() {
  return {
    title: 'Tanween: All 3 Forms Together',
    goal: 'Learn all three tanween marks - fathatain, kasratain and dammatain - and what they add to a word.',
    arabicWord: 'سَلَامٌ',
    meaning: 'peace (indefinite)',
    reference: 'Surah Al-Qadr 97:5',
    transliteration: 'Salamun',
    type: 'tanween',
    concept:
      'Tanween adds an extra "n" sound to the end of a word, showing the word is indefinite ("a peace", not "the peace"). ' +
      'There are three forms, depending on which vowel comes right before the "n" sound: fathatain (an), kasratain (in), and dammatain (un).',
    extra: {
      quranRef: { surah: 97, ayah: 5, surahName: 'Al-Qadr' },
      tanweenForms: {
        intro: 'Tanween adds an "n" sound to the end of a word to show it is indefinite - tap each one to hear the difference.',
        forms: [
          { key: 'fathatain', mark: 'ً', arabic: 'كِتَابًا', transliteration: 'Kitaaban', label: 'Fathatain (an)' },
          { key: 'kasratain', mark: 'ٍ', arabic: 'كِتَابٍ', transliteration: 'Kitaabin', label: 'Kasratain (in)' },
          { key: 'dammatain', mark: 'ٌ', arabic: 'كِتَابٌ', transliteration: 'Kitaabun', label: 'Dammatain (un)' },
        ],
      },
    },
  };
}

// Kid-level tajweed rules, woven directly into Stage 4 (noon-sakinah/tanween
// rules) and Stage 5 (rules tied to madd letters) rather than a separate
// Lesson Hub pillar - each rule only makes sense once tanween/madd are
// already known, so it stays sequential with that content.
const TAJWEED_RULES = {
  ghunnah: {
    name: 'Ghunnah (Nasal Sound)',
    kidExplanation:
      'Ghunnah is a gentle humming sound through the nose, held for about 2 counts. It happens whenever a noon (ن) or meem (م) has a shaddah on it.',
  },
  qalqalah: {
    name: 'Qalqalah (Bouncing Sound)',
    kidExplanation:
      'Qalqalah is a little "bounce" you add to 5 special letters (ق ط ب ج د) whenever one of them has no vowel of its own - it makes the letter pop instead of falling flat and silent.',
  },
  idgham: {
    name: 'Idgham (Merging)',
    kidExplanation:
      'When tanween or a silent noon (ن) is followed by one of a specific set of letters, its sound merges straight into that next letter instead of being said on its own.',
  },
  ikhfa: {
    name: 'Ikhfa (Hiding)',
    kidExplanation:
      'When tanween or a silent noon (ن) is followed by certain other letters, the "n" sound is hidden - said softly through the nose rather than said clearly.',
  },
  izhar: {
    name: 'Izhar (Clear Pronunciation)',
    kidExplanation:
      'When tanween or a silent noon (ن) is followed by one of 6 "throat letters" (ء ه ع ح غ خ), you say the "n" sound clearly and fully - no merging, no hiding, no bounce, just a clean, plain "n".',
  },
  iqlab: {
    name: 'Iqlab (Conversion)',
    kidExplanation:
      'When tanween or a silent noon (ن) is followed by the letter ب, the "n" sound converts into a hidden "m" sound instead - your lips close as if to say م, held with a gentle Ghunnah hum.',
  },
  'meem-sakinah': {
    name: 'Meem Sakinah Rules',
    kidExplanation:
      'A silent meem (م) has its own version of these same rules: hidden with a hum before ب (Ikhfa Shafawi), merged into another meem (Idgham Shafawi), or said clearly before any other letter (Izhar Shafawi).',
  },
  'qalqalah-kubra': {
    name: 'Qalqalah Kubra (Major Bounce)',
    kidExplanation:
      'Qalqalah gets even stronger - a "major" bounce - when one of the 5 qalqalah letters (ق ط ب ج د) is the very last sound before you stop reading, like pausing at the end of an ayah.',
  },
  waqf: {
    name: 'Waqf (Stopping)',
    kidExplanation:
      'Waqf means pausing your recitation - usually at the end of an ayah, to take a breath and let the meaning settle, rather than rushing straight into the next verse.',
  },
  'madd-aarid': {
    name: "Madd 'Aarid Lissukoon (Temporary Madd at a Stop)",
    kidExplanation:
      'When you stop (waqf) right after a long vowel sound, you can stretch that vowel even longer than usual - 2 to 6 counts - since you\'re pausing there anyway. It only happens because you chose to stop, not because the word itself demands it.',
  },
};
function tajweedRuleItem(ruleKey, { arabicWord, meaning, reference, transliteration, quranRef }) {
  const rule = TAJWEED_RULES[ruleKey];
  return {
    title: `Tajweed: ${rule.name}`,
    goal: `Learn the ${rule.name} rule and hear it in a real ayah.`,
    arabicWord,
    meaning,
    reference,
    transliteration,
    type: 'tajweed-rule',
    concept: rule.kidExplanation,
    extra: {
      quranRef,
      tajweedRule: { key: ruleKey, name: rule.name, kidExplanation: rule.kidExplanation, example: { arabic: arabicWord, transliteration, quranRef } },
    },
  };
}

// Kid-appropriate madd (vowel-length) typology for Stage 5, replacing the
// bare short-vs-long-only treatment. Only the 3 types a beginner actually
// needs are covered - not the full scholarly tajweed taxonomy.
const MADD_TYPES = {
  natural: {
    name: 'Madd Asli (Natural Madd)',
    countLabel: '2 counts',
    explanation: 'The most basic stretch - just hold the vowel sound for 2 counts, with nothing extra right after it.',
  },
  muttasil: {
    name: 'Madd Muttasil (Connected Madd)',
    countLabel: '4-5 counts',
    explanation: 'When the stretched vowel is followed by a hamza (ء) in the SAME word, hold it longer - 4 to 5 counts.',
  },
  munfasil: {
    name: 'Madd Munfasil (Separated Madd)',
    countLabel: '4-5 counts',
    explanation: 'When a word ending in a stretched vowel is followed by the NEXT word starting with a hamza (ء), also hold it 4 to 5 counts.',
  },
};
function maddTypeItem(typeKey, { arabicWord, meaning, reference, transliteration, quranRef }) {
  const type = MADD_TYPES[typeKey];
  return {
    title: `Madd: ${type.name}`,
    goal: `Learn what ${type.name} is and hear it in a real ayah.`,
    arabicWord,
    meaning,
    reference,
    transliteration,
    type: 'madd-type',
    concept: `Madd means stretching a vowel sound for extra counts instead of just one. ${type.name} is held for ${type.countLabel}. ${type.explanation}`,
    extra: {
      quranRef,
      maddTypes: {
        types: [
          {
            key: typeKey,
            name: type.name,
            countLabel: type.countLabel,
            explanation: type.explanation,
            example: { arabic: arabicWord, transliteration, translation: meaning, quranRef },
          },
        ],
      },
    },
  };
}

// Attaches a `recapGroup` to the last lesson of each 3-lesson checkpoint
// window, reusing the same checkpointBoundaries() the checkpoint builder
// uses so recap placement and checkpoint placement never drift apart.
function attachRecapGroups(items, summaries) {
  const bounds = checkpointBoundaries(items.length);
  let prevBound = 0;
  bounds.forEach((bound, i) => {
    const covered = items.slice(prevBound, bound);
    const lastItem = items[bound - 1];
    lastItem.extra = {
      ...(lastItem.extra || {}),
      recapGroup: {
        checkpointOrder: i + 1,
        summary: summaries?.[i] || `You covered: ${covered.map((it) => it.title).join(', ')}.`,
        highlights: covered.map((it) => ({ arabic: it.arabicWord, label: it.title, note: it.meaning })),
      },
    };
    prevBound = bound;
  });
  return items;
}

// --- Stage 1: Letter Shapes I (8 lessons = 8 letter-pairs = letters 1-16) ---
const stage1Items = [];
for (let i = 0; i < 16; i += 2) stage1Items.push(letterPairItem(LETTERS[i], LETTERS[i + 1], { isFirstLesson: i === 0 }));
attachRecapGroups(stage1Items);

// --- Stage 2: Letter Shapes II & Harakat Intro (6 pairs = letters 17-28, + Fatha + Kasra) ---
const stage2Items = [];
for (let i = 16; i < 28; i += 2) stage2Items.push(letterPairItem(LETTERS[i], LETTERS[i + 1]));
stage2Items.push(harakatItem(HARAKAT[0])); // Fatha
stage2Items.push(harakatItem(HARAKAT[1])); // Kasra
attachRecapGroups(stage2Items);

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
attachRecapGroups(stage3Items);

// --- Stage 4: Tanween & Sukoon (9 lessons: tanween-all-3-forms, 3 tajweed
// rules woven in, shaddah/sukoon, + trimmed practice) ---
const stage4Items = [
  tanweenItem(),
  tajweedRuleItem('ghunnah', {
    arabicWord: 'إِنَّا',
    meaning: 'indeed, We',
    reference: 'Surah Al-Kawthar 108:1',
    transliteration: 'Inna',
    quranRef: { surah: 108, ayah: 1, surahName: 'Al-Kawthar' },
  }),
  tajweedRuleItem('qalqalah', {
    arabicWord: 'قَدْ',
    meaning: 'certainly, already',
    reference: 'Surah Al-Muminun 23:1',
    transliteration: 'Qad',
    quranRef: { surah: 23, ayah: 1, surahName: 'Al-Muminun' },
  }),
  tajweedRuleItem('idgham', {
    arabicWord: 'مِن رَّبِّهِمْ',
    meaning: 'from their Lord',
    reference: 'Surah Al-Baqarah 2:5',
    transliteration: 'Mir-rabbihim',
    quranRef: { surah: 2, ayah: 5, surahName: 'Al-Baqarah' },
  }),
  harakatItem(HARAKAT[4]), // Shaddah & Sukoon
  practiceItem(LETTERS[3], 'Sukoon'), // thaa -> Thabat
  practiceItem(LETTERS[10], 'Tanween'), // zaay -> Zakat
  practiceItem(LETTERS[13], 'Sukoon'), // saad -> Sirat
  practiceItem(LETTERS[20], 'Sukoon'), // qaaf -> Quran
];
attachRecapGroups(stage4Items, [
  "You met tanween's 3 forms (fathatain/kasratain/dammatain) and 2 tajweed rules: Ghunnah's gentle hum and Qalqalah's letter bounce.",
  "You learned Idgham (how sounds merge together), the Shaddah & Sukoon marks, and spotted Sukoon inside a word you already know.",
  'You reviewed Tanween and Sukoon inside 3 more familiar words - Zakah, Sirat, and Quran.',
]);

// --- Stage 5: Connecting Letters & Madd (8 lessons) ---
// `maddPair` (Stage 5 only): { short: {arabic, transliteration, label}, long: {arabic, transliteration, label} }
// for the harakat-vs-madd-letter tap-to-compare UI - reuses the same `extra`
// passthrough buildLessons() already spreads into content for letterPairItem.
function simpleItem(title, goal, arabicWord, meaning, reference, transliteration, { type = 'vocabulary', concept, maddPair, quranRef, comparisonSet } = {}) {
  return {
    title,
    goal,
    arabicWord,
    meaning,
    reference,
    transliteration,
    type,
    concept: concept || `${title} - the Arabic word is ${arabicWord} ("${meaning}"). Look at it, listen to how it sounds, and remember it through its connection to the Quran below.`,
    ...(maddPair || quranRef || comparisonSet
      ? { extra: { ...(maddPair ? { maddPair } : {}), ...(quranRef ? { quranRef } : {}), ...(comparisonSet ? { comparisonSet } : {}) } }
      : {}),
  };
}
const stage5Items = [
  simpleItem('Father', 'Read the connected word for "father".', 'أَب', 'father', 'Surah Yusuf 12:4, Yusuf speaking to his father', 'Ab', {
    quranRef: { surah: 12, ayah: 4, surahName: 'Yusuf' },
  }),
  simpleItem('Mother', 'Read the connected word for "mother".', 'أُمّ', 'mother', 'Surah Al-Qasas 28:7, the mother of Musa', 'Umm', {
    quranRef: { surah: 28, ayah: 7, surahName: 'Al-Qasas' },
  }),
  maddTypeItem('natural', {
    arabicWord: 'قَالَ',
    meaning: 'he said',
    reference: 'Surah Al-Baqarah 2:30',
    transliteration: 'Qala',
    quranRef: { surah: 2, ayah: 30, surahName: 'Al-Baqarah' },
  }),
  maddTypeItem('muttasil', {
    arabicWord: 'جَاءَ',
    meaning: 'he came',
    reference: 'Surah An-Nasr 110:1',
    transliteration: "Ja'a",
    quranRef: { surah: 110, ayah: 1, surahName: 'An-Nasr' },
  }),
  maddTypeItem('munfasil', {
    arabicWord: 'يَا أَيُّهَا',
    meaning: 'O you who...',
    reference: 'Surah Al-Baqarah 2:21',
    transliteration: 'Ya ayyuha',
    quranRef: { surah: 2, ayah: 21, surahName: 'Al-Baqarah' },
  }),
  tajweedRuleItem('ikhfa', {
    arabicWord: 'مِن قَبْلِكَ',
    meaning: 'before you',
    reference: 'Surah Al-Baqarah 2:4',
    transliteration: 'Min qablika',
    quranRef: { surah: 2, ayah: 4, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Son / Child', 'Read the connected word for "son".', 'اِبْن', 'son', 'Surah Maryam 19:34, "Isa, the son of Maryam"', 'Ibn', {
    quranRef: { surah: 19, ayah: 34, surahName: 'Maryam' },
  }),
  simpleItem('Brother', 'Read the connected word for "brother".', 'أَخ', 'brother', 'Surah Yusuf 12:8, the brothers of Yusuf', 'Akh', {
    quranRef: { surah: 12, ayah: 8, surahName: 'Yusuf' },
  }),
  simpleItem('Madd: Light', 'Hear the long "oo" (madd) sound in a word you already know.', 'نُور', 'light', 'Surah An-Nur 24:35', 'Nur', {
    type: 'madd',
    quranRef: { surah: 24, ayah: 35, surahName: 'An-Nur' },
    maddPair: {
      short: { arabic: 'نُ', transliteration: 'Nu', label: 'Short (1 count)' },
      long: { arabic: 'نُو', transliteration: 'Nuu', label: 'Long (2 counts) - waw madd' },
    },
  }),
];
attachRecapGroups(stage5Items, [
  "You met the connected words for father and mother, then Madd Asli - the natural 2-count vowel stretch.",
  'You learned Madd Muttasil and Munfasil (both stretched 4-5 counts when a hamza is nearby) and the Ikhfa tajweed rule.',
  'You reviewed the connected words for son and brother, and revisited madd with a different madd letter (waw, not alif).',
]);

// --- Stage 6: First 3-Letter Words (10 lessons: colours + numbers + shapes) ---
const stage6Items = [
  simpleItem('Colour: Yellow', 'Learn the colour yellow.', 'أَصْفَر', 'yellow', 'Surah Al-Baqarah 2:69, describing a bright yellow cow', 'Asfar', { type: 'color', quranRef: { surah: 2, ayah: 69, surahName: 'Al-Baqarah' } }),
  simpleItem('Colour: White', 'Learn the colour white.', 'أَبْيَض', 'white', 'Surah Fatir 35:27, describing white mountain streaks', 'Abyad', { type: 'color', quranRef: { surah: 35, ayah: 27, surahName: 'Fatir' } }),
  simpleItem('Colour: Green', 'Learn the colour green.', 'أَخْضَر', 'green', 'Surah Al-Insan 76:21, the green garments of Paradise', 'Akhdar', { type: 'color', quranRef: { surah: 76, ayah: 21, surahName: 'Al-Insan' } }),
  simpleItem('Colour: Black', 'Learn the colour black.', 'أَسْوَد', 'black', 'Surah Fatir 35:27, describing black mountain streaks', 'Aswad', { type: 'color', quranRef: { surah: 35, ayah: 27, surahName: 'Fatir' } }),
  simpleItem('Numbers 1-3', 'Learn one, two, three and their Quranic connection.', 'وَاحِد', 'one', 'Surah Al-Ikhlas 112:1, "Qul huwa Allahu ahad"', 'Wahid', { type: 'number', quranRef: { surah: 112, ayah: 1, surahName: 'Al-Ikhlas' } }),
  simpleItem('Numbers 4-6', 'Learn four, five, six and their Quranic connection.', 'سِتَّة', 'six', "Surah Al-A'raf 7:54, heavens and earth in six days", 'Sittah', { type: 'number', quranRef: { surah: 7, ayah: 54, surahName: "Al-A'raf" } }),
  simpleItem('Numbers 7-9', 'Learn seven, eight, nine and their Quranic connection.', 'سَبْع', 'seven', 'Surah Al-Hijr 15:87, "the seven oft-repeated verses"', "Sab'", { type: 'number', quranRef: { surah: 15, ayah: 87, surahName: 'Al-Hijr' } }),
  simpleItem('Number 10', 'Learn ten and its Quranic connection.', 'عَشْر', 'ten', 'Surah Al-Fajr 89:2, "by the ten nights"', 'Ashr', { type: 'number', quranRef: { surah: 89, ayah: 2, surahName: 'Al-Fajr' } }),
  simpleItem('Shape: Circle', 'Learn the word for circle.', 'دَائِرَة', 'circle', 'a shape seen throughout Allah’s creation', "Da'irah", { type: 'shape' }),
  simpleItem('Shape: Crescent', 'Learn the word for crescent moon.', 'هِلَال', 'crescent moon', 'a symbol used to mark Islamic months', 'Hilal', { type: 'shape' }),
];

// --- Stage 7: Islamic Vocabulary I (10 lessons) ---
const stage7Items = [
  simpleItem('Allah', 'The name of God in Islam.', 'اللّٰه', 'Allah', 'used throughout the Quran', 'Allah'),
  simpleItem('Rabb', 'A name meaning "Lord" or "Sustainer".', 'رَبّ', 'Lord', 'Surah Al-Fatihah 1:2, "Rabbil-’alameen"', 'Rabb', { quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' } }),
  simpleItem('Salah', 'The Arabic word for the ritual prayer.', 'صَلَاة', 'prayer', 'Surah Al-Baqarah 2:3, "those who establish prayer"', 'Salah', { quranRef: { surah: 2, ayah: 3, surahName: 'Al-Baqarah' } }),
  simpleItem('Quran', 'The final revelation, recited by Muslims worldwide.', 'قُرْآن', 'the recitation', 'the final revelation', 'Quran'),
  simpleItem('Nabi', 'The Arabic word for a Prophet.', 'نَبِيّ', 'Prophet', 'used throughout the Quran for Allah’s messengers', 'Nabi'),
  simpleItem('Malak', 'The Arabic word for Angel.', 'مَلَك', 'angel', 'Surah Al-Baqarah 2:30, angels mentioned to Adam’s creation', 'Malak', { quranRef: { surah: 2, ayah: 30, surahName: 'Al-Baqarah' } }),
  simpleItem('Rasul', 'The Arabic word for Messenger.', 'رَسُول', 'messenger', 'used throughout the Quran for Prophets sent with a message', 'Rasul'),
  simpleItem('Ummah', 'The Arabic word for community or nation.', 'أُمَّة', 'community', 'Surah Al-Baqarah 2:143, "a middle nation"', 'Ummah', { quranRef: { surah: 2, ayah: 143, surahName: 'Al-Baqarah' } }),
  simpleItem('Iman', 'The Arabic word for faith or belief.', 'إِيمَان', 'faith', 'Surah Al-Hujurat 49:14, discussing faith entering the heart', 'Iman', { quranRef: { surah: 49, ayah: 14, surahName: 'Al-Hujurat' } }),
  simpleItem('Islam', 'The Arabic word meaning submission to Allah.', 'إِسْلَام', 'submission (to Allah)', 'Surah Aal-E-Imran 3:19, "the religion in the sight of Allah is Islam"', 'Islam', { quranRef: { surah: 3, ayah: 19, surahName: 'Aal-E-Imran' } }),
];

// --- Stage 8: Islamic Vocabulary II & Phrases (10 lessons) ---
const stage8Items = [
  simpleItem('Bismillah', 'The phrase said before starting any good action.', 'بِسْمِ اللَّهِ', 'in the name of Allah', 'Surah Al-Fatihah 1:1', 'Bismillah', { type: 'phrase', quranRef: { surah: 1, ayah: 1, surahName: 'Al-Fatihah' } }),
  simpleItem('Alhamdulillah', 'The phrase of praise and thanks to Allah.', 'الْحَمْدُ لِلَّه', 'all praise is due to Allah', 'Surah Al-Fatihah 1:2', 'Alhamdulillah', { type: 'phrase', quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' } }),
  simpleItem('Subhanallah', 'The phrase said to glorify Allah.', 'سُبْحَانَ اللَّه', 'glory be to Allah', 'used throughout the Quran to declare Allah’s perfection', 'Subhanallah', { type: 'phrase' }),
  simpleItem('Astaghfirullah', 'The phrase said to ask Allah’s forgiveness.', 'أَسْتَغْفِرُ اللَّه', 'I seek Allah’s forgiveness', 'a phrase rooted in the Quran’s calls to seek forgiveness', 'Astaghfirullah', { type: 'phrase' }),
  simpleItem('InshaAllah', 'The phrase said when speaking of the future.', 'إِنْ شَاءَ اللَّه', 'if Allah wills', 'Surah Al-Kahf 18:23-24, commanding this phrase for future plans', 'InshaAllah', { type: 'phrase', quranRef: { surah: 18, ayah: 23, surahName: 'Al-Kahf' } }),
  simpleItem('MashaAllah', 'The phrase said when admiring something good.', 'مَا شَاءَ اللَّه', 'what Allah has willed', 'Surah Al-Kahf 18:39', 'MashaAllah', { type: 'phrase', quranRef: { surah: 18, ayah: 39, surahName: 'Al-Kahf' } }),
  simpleItem('Assalamu Alaykum', 'The Islamic greeting of peace.', 'اَلسَّلَامُ عَلَيْكُم', 'peace be upon you', 'Surah An-Nisa 4:86, the command to return greetings well', 'Assalamu Alaykum', { type: 'phrase', quranRef: { surah: 4, ayah: 86, surahName: 'An-Nisa' } }),
  simpleItem('La ilaha illallah', 'The first half of the declaration of faith.', 'لَا إِلَٰهَ إِلَّا اللَّه', 'there is no god but Allah', 'Surah As-Saffat 37:35', 'La ilaha illallah', { type: 'phrase', quranRef: { surah: 37, ayah: 35, surahName: 'As-Saffat' } }),
  simpleItem('Allahu Akbar', 'The phrase declaring Allah is greatest, said in prayer.', 'اللَّهُ أَكْبَر', 'Allah is greatest', 'said throughout the five daily prayers', 'Allahu Akbar', { type: 'phrase' }),
  simpleItem('Surah Al-Ikhlas, Ayah 1', 'Read the opening of a short, well-known surah.', 'قُلْ هُوَ اللَّهُ أَحَدٌ', 'Say: He is Allah, One', 'Surah Al-Ikhlas 112:1', 'Qul huwa Allahu ahad', { type: 'reading', quranRef: { surah: 112, ayah: 1, surahName: 'Al-Ikhlas' } }),
];

// --- Stage 9: Nouns & Gender (10 lessons) ---
const stage9Items = [
  simpleItem('The definite article (ال)', 'Learn how "the" attaches to the front of a noun.', 'الْحَمْدُ', 'the praise', 'Surah Al-Fatihah 1:2', 'Al-hamdu', {
    concept: 'In Arabic, there is no separate word for "the" - instead, you attach ال (alif-lam) directly to the front of a noun. This one prefix does the job of the English word "the" every single time, with no exceptions for singular or plural.',
    quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Gender: masculine & feminine', 'Learn how Ta Marbuta (ة) marks a feminine noun.', 'مُسْلِمَة', 'a Muslim woman', 'Surah Al-Ahzab 33:35', 'Muslimah', {
    concept: 'Every Arabic noun is either masculine or feminine - there is no neutral "it". Feminine nouns usually end in ة (Ta Marbuta), pronounced as a soft "ah", though a few feminine nouns don\'t have it and a few ة-ending nouns aren\'t feminine.',
    quranRef: { surah: 33, ayah: 35, surahName: 'Al-Ahzab' },
    comparisonSet: {
      intro: 'Compare the masculine and feminine forms of the same word side by side.',
      items: [
        { arabic: 'مُسْلِم', transliteration: 'Muslim', translation: 'a Muslim man', label: 'Masculine' },
        { arabic: 'مُسْلِمَة', transliteration: 'Muslimah', translation: 'a Muslim woman', label: 'Feminine (+ة)' },
      ],
    },
  }),
  simpleItem('Singular, dual & plural', 'Learn how nouns change for one, two, or many.', 'السَّمَاوَات', 'the heavens (plural)', 'Surah Al-Baqarah 2:29', 'As-samawat', {
    concept: 'Arabic has three number forms, not two: singular (one), dual (exactly two), and plural (three or more). The dual form is unique to Arabic among major world languages and uses its own special ending.',
    quranRef: { surah: 2, ayah: 29, surahName: 'Al-Baqarah' },
    comparisonSet: {
      intro: 'Compare the singular and plural forms of the same word.',
      items: [
        { arabic: 'سَمَاء', transliteration: 'Sama', translation: 'sky/heaven', label: 'Singular' },
        { arabic: 'السَّمَاوَات', transliteration: 'As-samawat', translation: 'the heavens', label: 'Plural' },
      ],
    },
  }),
  simpleItem('Sound masculine plural', 'Learn the -un/-in ending for regular masculine plurals.', 'مُسْلِمُونَ', 'Muslims (masc. plural)', 'Surah Al-Hijr 15:2', 'Muslimun', {
    concept: '"Sound" plurals follow a predictable, regular pattern - you just add an ending to the singular. For masculine words describing people, that ending is ون (-un) or ين (-in), depending on the noun\'s grammatical role.',
    quranRef: { surah: 15, ayah: 2, surahName: 'Al-Hijr' },
    comparisonSet: {
      intro: 'Compare the singular and its regular ("sound") masculine plural.',
      items: [
        { arabic: 'مُسْلِم', transliteration: 'Muslim', translation: 'a Muslim man', label: 'Singular' },
        { arabic: 'مُسْلِمُونَ', transliteration: 'Muslimun', translation: 'Muslims', label: 'Plural (+ون)' },
      ],
    },
  }),
  simpleItem('Sound feminine plural', 'Learn the -at ending for regular feminine plurals.', 'مُسْلِمَات', 'Muslim women', 'Surah Al-Ahzab 33:35', 'Muslimat', {
    concept: 'Feminine nouns usually pluralize by swapping their ة ending for ات (-at) - a regular, predictable pattern, unlike the "broken" plurals many masculine nouns use.',
    quranRef: { surah: 33, ayah: 35, surahName: 'Al-Ahzab' },
    comparisonSet: {
      intro: 'Compare the singular and its regular ("sound") feminine plural.',
      items: [
        { arabic: 'مُسْلِمَة', transliteration: 'Muslimah', translation: 'a Muslim woman', label: 'Singular' },
        { arabic: 'مُسْلِمَات', transliteration: 'Muslimat', translation: 'Muslim women', label: 'Plural (ة→ات)' },
      ],
    },
  }),
  simpleItem('Broken plurals', 'Learn how some plurals change form entirely.', 'كُتُب', 'books (plural of kitab)', 'used throughout the Quran', 'Kutub', {
    concept: 'Not all Arabic plurals just add an ending - many nouns change their internal vowel pattern entirely, the way English "mouse" becomes "mice" instead of "mouses". These are called "broken" plurals, and you simply have to learn each one.',
    comparisonSet: {
      intro: 'Compare the singular and its "broken" plural - notice the internal vowels change instead of just adding an ending.',
      items: [
        { arabic: 'كِتَاب', transliteration: 'Kitab', translation: 'book', label: 'Singular' },
        { arabic: 'كُتُب', transliteration: 'Kutub', translation: 'books', label: 'Broken plural' },
      ],
    },
  }),
  simpleItem('Adjective agreement', 'Learn how adjectives must match their noun.', 'الصِّرَاطَ الْمُسْتَقِيمَ', 'the straight path', 'Surah Al-Fatihah 1:6', "As-sirata l-mustaqim", {
    concept: 'In Arabic, an adjective must match the noun it describes in gender, number, and definiteness - if the noun has ال ("the"), the adjective needs it too. This is different from English, where adjectives never change form.',
    quranRef: { surah: 1, ayah: 6, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Noun cases: intro', 'A first look at how noun endings shift with grammar role.', 'رَبُّ الْعَالَمِينَ', 'Lord of the worlds', 'Surah Al-Fatihah 1:2', "Rabbu l-alamin", {
    concept: 'Arabic nouns can take different endings depending on their grammatical role in a sentence - whether they\'re the subject, the object, or a possessor. These are called "cases" - this is just a first, gentle introduction to the idea.',
    quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Common nouns review', 'Review key nouns learned so far in context.', 'بَيْتُ اللَّه', 'the House of Allah (the Kaaba)', 'Surah Al-Baqarah 2:125', 'Baytullah', {
    concept: 'Let\'s bring together key nouns you\'ve learned so far and see them combined into one real, meaningful phrase.',
    quranRef: { surah: 2, ayah: 125, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Stage 9 review: nouns', 'Bring together everything learned about nouns and gender.', 'الرَّحْمَٰنِ الرَّحِيمِ', 'the Most Merciful, the Especially Merciful', 'Surah Al-Fatihah 1:3', "Ar-Rahmani r-Rahim", {
    concept: 'Time to review everything from this stage: the definite article ال, masculine and feminine gender, singular/dual/plural, sound and broken plurals, and adjective agreement.',
    quranRef: { surah: 1, ayah: 3, surahName: 'Al-Fatihah' },
  }),
];

// --- Stage 10: Demonstratives & Definite Article (10 lessons) ---
const stage10Items = [
  simpleItem('This (masculine): هذا', 'Learn the masculine word for "this".', 'هَٰذَا الْكِتَابُ', 'this is the Book', 'used to introduce the Quran in commentary', "Hadha l-kitab", {
    concept: 'هذا (hadha) means "this" when pointing to something masculine and nearby. Arabic demonstrative words change based on the gender of what you\'re pointing to - there\'s no single "this" that works for everything.',
    comparisonSet: {
      intro: 'Compare the masculine and feminine forms of "this".',
      items: [
        { arabic: 'هَٰذَا', transliteration: 'Hadha', translation: 'this (masculine)', label: 'Masculine' },
        { arabic: 'هَٰذِهِ', transliteration: 'Hadhihi', translation: 'this (feminine)', label: 'Feminine' },
      ],
    },
  }),
  simpleItem('This (feminine): هذه', 'Learn the feminine word for "this".', 'هَٰذِهِ', 'this (feminine)', 'used throughout the Quran', 'Hadhihi', {
    concept: 'هذه (hadhihi) is the feminine version of "this" - used for feminine nouns or a woman/girl. Notice it\'s the same base word as هذا with feminine markers added.',
    comparisonSet: {
      intro: 'Compare the feminine and masculine forms of "this".',
      items: [
        { arabic: 'هَٰذِهِ', transliteration: 'Hadhihi', translation: 'this (feminine)', label: 'Feminine' },
        { arabic: 'هَٰذَا', transliteration: 'Hadha', translation: 'this (masculine)', label: 'Masculine' },
      ],
    },
  }),
  simpleItem('That: ذلك', 'Learn the word for "that", used to open Surah Al-Baqarah.', 'ذَٰلِكَ الْكِتَابُ', 'that is the Book', 'Surah Al-Baqarah 2:2', "Dhalika l-kitab", {
    concept: 'ذلك (dhalika) means "that" - used for something farther away, instead of هذا ("this"), which points to something nearby. Surah Al-Baqarah famously opens with ذلك الكتاب, "that is the Book (about which there is no doubt)".',
    quranRef: { surah: 2, ayah: 2, surahName: 'Al-Baqarah' },
    comparisonSet: {
      intro: 'Compare "this" (nearby) and "that" (far away).',
      items: [
        { arabic: 'هَٰذَا', transliteration: 'Hadha', translation: 'this (nearby)', label: 'This' },
        { arabic: 'ذَٰلِكَ', transliteration: 'Dhalika', translation: 'that (far away)', label: 'That' },
      ],
    },
  }),
  simpleItem('Sun letters', 'Learn which letters absorb the ل of ال (Ar-Rahman, not Al-Rahman).', 'الرَّحْمَٰن', 'the Most Merciful', 'Surah Al-Fatihah 1:3', 'Ar-Rahman', {
    concept: 'When ال ("the") comes before certain letters - called "sun letters" - the ل sound disappears and the next letter doubles instead. That\'s why اَلرَّحْمَٰن is pronounced "Ar-Rahman", not "Al-Rahman".',
    quranRef: { surah: 1, ayah: 3, surahName: 'Al-Fatihah' },
    comparisonSet: {
      intro: 'Compare a sun-letter word (ل disappears) with a moon-letter word (ل stays clear).',
      items: [
        { arabic: 'الرَّحْمَٰن', transliteration: 'Ar-Rahman', translation: 'the Most Merciful', label: 'Sun letter - ل hidden' },
        { arabic: 'الْقَمَر', transliteration: 'Al-Qamar', translation: 'the moon', label: 'Moon letter - ل clear' },
      ],
    },
  }),
  simpleItem('Moon letters', 'Learn which letters keep the ل of ال pronounced clearly.', 'الْقَمَر', 'the moon', 'Surah Al-Qamar 54:1', 'Al-Qamar', {
    concept: '"Moon letters" are the opposite of sun letters: when ال comes before one of them, the ل is pronounced clearly, exactly as written - like اَلْقَمَر, "Al-Qamar" ("the moon"), which is actually where "moon letters" get their name from.',
    quranRef: { surah: 54, ayah: 1, surahName: 'Al-Qamar' },
    comparisonSet: {
      intro: 'Compare a moon-letter word (ل stays clear) with a sun-letter word (ل disappears).',
      items: [
        { arabic: 'الْقَمَر', transliteration: 'Al-Qamar', translation: 'the moon', label: 'Moon letter - ل clear' },
        { arabic: 'الرَّحْمَٰن', transliteration: 'Ar-Rahman', translation: 'the Most Merciful', label: 'Sun letter - ل hidden' },
      ],
    },
  }),
  simpleItem('The Idafa (possessive) construction', 'Learn how two nouns link to show possession.', 'رَبِّ الْعَالَمِينَ', 'Lord of the worlds', 'Surah Al-Fatihah 1:2', "Rabbi l-alamin", {
    concept: 'Idafa is how Arabic shows possession by simply placing two nouns next to each other - no separate word for "of" needed. رَبِّ الْعَالَمِينَ literally reads "Lord (of) the worlds", with the possession built into the word order itself.',
    quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Idafa in practice: House of Allah', 'See the Idafa construction in a famous phrase.', 'بَيْتُ اللَّه', 'House of Allah (the Kaaba)', 'Surah Al-Baqarah 2:125', 'Baytullah', {
    concept: 'Here\'s Idafa again in one of the most famous phrases in Islam: بَيْتُ اللَّه, literally "House (of) Allah" - two nouns side by side, with possession understood without any extra word.',
    quranRef: { surah: 2, ayah: 125, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Attached pronouns: my/your', 'Learn how ي and ك attach to nouns to mean "my" and "your".', 'رَبِّي', 'my Lord', 'used throughout the Quran', 'Rabbi', {
    concept: 'Instead of a separate word for "my" or "your", Arabic attaches a small suffix directly onto the noun: ي for "my" and ك for "your". رَبِّي means "my Lord" - just the word for "Lord" plus ي stuck on the end.',
  }),
  simpleItem('Attached pronouns: his/her', 'Learn how ه and ها attach to nouns.', 'رَبُّهُ', 'his Lord', 'used throughout the Quran', 'Rabbuhu', {
    concept: 'The same pattern continues for "his" (ه) and "her" (ها) attached directly to a noun. رَبُّهُ means "his Lord" - notice how compact this is compared to English, which needs a whole separate word.',
  }),
  simpleItem('Stage 10 review: demonstratives', 'Review this/that and the sun/moon letter rule.', 'ذَٰلِكَ الصِّرَاطُ الْمُسْتَقِيم', 'that is the straight path', 'Surah Al-An’am 6:153', "Dhalika s-siratu l-mustaqim", {
    concept: 'Review time: this/that, the sun and moon letter rule, the Idafa possessive construction, and attached pronouns for my/your/his/her.',
    quranRef: { surah: 6, ayah: 153, surahName: "Al-An'am" },
  }),
];

// --- Stage 11: Prepositions & Location (10 lessons) ---
const stage11Items = [
  simpleItem('Fi: in', 'Learn the preposition "in".', 'فِي قُلُوبِهِم', 'in their hearts', 'Surah Al-Baqarah 2:10', 'Fi qulubihim', {
    concept: 'فِي means "in" or "inside" - one of the most common prepositions in the Quran, always placed directly before the noun it governs, with no extra words needed.',
    quranRef: { surah: 2, ayah: 10, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Ala: on', 'Learn the preposition "on/upon".', 'عَلَيْهِم', 'upon them', 'used throughout the Quran', 'Alayhim', {
    concept: 'عَلَى means "on" or "upon" - used for physical position (on top of something), and very often in the Quran to describe being reliant upon or entrusted with something.',
  }),
  simpleItem('Min: from', 'Learn the preposition "from".', 'مِنَ اللَّه', 'from Allah', 'used throughout the Quran', 'Minallah', {
    concept: 'مِن means "from" - used to show origin, source, or a starting point, and is one of the very first prepositions a new Arabic reader will meet again and again.',
  }),
  simpleItem('Ila: to', 'Learn the preposition "to/towards".', 'إِلَى اللَّه', 'to Allah', 'Surah Al-Baqarah 2:156, "to Him we return"', 'Ilallah', {
    concept: 'إِلَى means "to" or "towards" - showing movement or direction toward something, as in the well-known Quranic phrase "to Him we return".',
    quranRef: { surah: 2, ayah: 156, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Bi: with/by', 'Learn the preposition "with/by", seen in Bismillah.', 'بِسْمِ اللَّه', 'in/by the name of Allah', 'Surah Al-Fatihah 1:1', 'Bismillah', {
    concept: 'بِ means "with", "by", or "in" depending on context, and attaches directly to the front of the next word rather than standing alone - exactly as you\'ve already seen in بِسْمِ, "in/by the name of".',
    quranRef: { surah: 1, ayah: 1, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Taht: under', 'Learn the word for "under".', 'تَحْتَهَا الْأَنْهَار', 'beneath which rivers flow', 'a phrase describing Paradise, used repeatedly in the Quran', "Tahtaha l-anhar", {
    concept: 'تَحْتَ means "under" or "beneath" - used again and again in the Quran\'s description of Paradise: gardens beneath which rivers flow.',
    comparisonSet: {
      intro: 'Compare these two opposite location words.',
      items: [
        { arabic: 'تَحْتَ', transliteration: 'Tahta', translation: 'under/beneath', label: 'Under' },
        { arabic: 'فَوْقَ', transliteration: 'Fawqa', translation: 'above/over', label: 'Above' },
      ],
    },
  }),
  simpleItem('Fawq: above', 'Learn the word for "above".', 'فَوْقَ', 'above', 'used throughout the Quran', 'Fawqa', {
    concept: 'فَوْقَ means "above" or "over" - the opposite of تَحْتَ ("under"), and just as common throughout the Quran when describing the heavens.',
    comparisonSet: {
      intro: 'Compare these two opposite location words.',
      items: [
        { arabic: 'فَوْقَ', transliteration: 'Fawqa', translation: 'above/over', label: 'Above' },
        { arabic: 'تَحْتَ', transliteration: 'Tahta', translation: 'under/beneath', label: 'Under' },
      ],
    },
  }),
  simpleItem('Amam: in front of', 'Learn the word for "in front of".', 'أَمَام', 'in front of', 'a common directional word in Arabic', 'Amam', {
    concept: 'أَمَام means "in front of" or "ahead of" - a straightforward directional word describing physical position.',
    comparisonSet: {
      intro: 'Compare these two opposite location words.',
      items: [
        { arabic: 'أَمَام', transliteration: 'Amam', translation: 'in front of', label: 'In front of' },
        { arabic: 'خَلْف', transliteration: 'Khalf', translation: 'behind', label: 'Behind' },
      ],
    },
  }),
  simpleItem('Khalf: behind', 'Learn the word for "behind".', 'خَلْف', 'behind', 'Surah Qaf 50:6, describing the sky above them', 'Khalf', {
    concept: 'خَلْف means "behind" - the opposite of أَمَام ("in front of"), completing this stage\'s set of core location words.',
    quranRef: { surah: 50, ayah: 6, surahName: 'Qaf' },
    comparisonSet: {
      intro: 'Compare these two opposite location words.',
      items: [
        { arabic: 'خَلْف', transliteration: 'Khalf', translation: 'behind', label: 'Behind' },
        { arabic: 'أَمَام', transliteration: 'Amam', translation: 'in front of', label: 'In front of' },
      ],
    },
  }),
  simpleItem('Stage 11 review: prepositions', 'Review the core location words learned in this stage.', 'مِن تَحْتِهَا الْأَنْهَار', 'from beneath which rivers flow', 'Surah Al-Baqarah 2:25', "Min tahtiha l-anhar", {
    concept: 'Review time: in, on, from, to, with/by, under, above, in front of, and behind - the core location words that let you describe where something is.',
    quranRef: { surah: 2, ayah: 25, surahName: 'Al-Baqarah' },
  }),
];

// --- Stage 12: Questions & Possession (Idafa) (10 lessons) ---
const stage12Items = [
  simpleItem('Man: who', 'Learn the question word "who".', 'مَن ذَا الَّذِي', 'who is the one who', 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', "Man dha lladhi", {
    concept: 'مَن means "who" - used to ask about a person, and appears in the Quran\'s famous rhetorical question from Ayat al-Kursi: "who is the one who could intercede with Him except by His permission?"',
    quranRef: { surah: 2, ayah: 255, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Ma: what', 'Learn the question word "what".', 'وَمَا أَدْرَاكَ', 'and what will make you know', 'used to introduce important surahs, e.g. Al-Qadr 97:2', 'Wa ma adraka', {
    concept: 'مَا means "what" - one of the most frequent question words in the Quran, often opening a verse to draw attention to something important, as in "and what will make you know...?"',
    quranRef: { surah: 97, ayah: 2, surahName: 'Al-Qadr' },
  }),
  simpleItem('Ayna: where', 'Learn the question word "where".', 'أَيْنَ مَا', 'wherever', 'Surah An-Nisa 4:78', 'Ayna ma', {
    concept: 'أَيْنَ means "where" - asking about location or place.',
    quranRef: { surah: 4, ayah: 78, surahName: 'An-Nisa' },
  }),
  simpleItem('Mata: when', 'Learn the question word "when".', 'مَتَى', 'when', 'used throughout the Quran to ask about the Hour', 'Mata', {
    concept: 'مَتَى means "when" - asking about time, frequently used in the Quran when people ask about the timing of the Day of Judgement.',
  }),
  simpleItem('Kayfa: how', 'Learn the question word "how".', 'كَيْفَ', 'how', 'Surah Al-Ghashiyah 88:17, "do they not look at the camels, how they were created"', 'Kayfa', {
    concept: 'كَيْفَ means "how" - asking about manner or method, as in the Quran\'s invitation to reflect: "do they not look at the camels, how they were created?"',
    quranRef: { surah: 88, ayah: 17, surahName: 'Al-Ghashiyah' },
  }),
  simpleItem('Hal: yes/no questions', 'Learn how "hal" introduces a yes/no question.', 'هَلْ أَتَاكَ', 'has there come to you', 'Surah Al-Ghashiyah 88:1', 'Hal ataka', {
    concept: 'هَلْ is placed at the very start of a sentence to turn it into a yes/no question - it doesn\'t translate to a single English word, it just signals "is this a question?"',
    quranRef: { surah: 88, ayah: 1, surahName: 'Al-Ghashiyah' },
  }),
  simpleItem('Idafa review: Lord of the Worlds', 'Practice the Idafa construction again in a new phrase.', 'مَالِكِ يَوْمِ الدِّين', 'Master of the Day of Judgement', 'Surah Al-Fatihah 1:4', "Maliki yawmi d-din", {
    concept: 'Another real Idafa example: مَالِكِ يَوْمِ الدِّين, "Master of the Day of Judgement" - two Idafa constructions chained together (Master-of-Day, Day-of-Judgement).',
    quranRef: { surah: 1, ayah: 4, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Idafa review: Day of Judgement', 'See "day" + "judgement" linked as an Idafa.', 'يَوْمِ الدِّين', 'the Day of Judgement', 'Surah Al-Fatihah 1:4', "Yawmi d-din", {
    concept: 'يَوْمِ الدِّين on its own means "the Day of Judgement" - يَوْم ("day") + الدِّين ("the judgement") linked by Idafa, exactly as you saw in the previous lesson.',
    quranRef: { surah: 1, ayah: 4, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Combining questions & Idafa', 'Practice asking "whose" using question words and Idafa together.', 'لِمَنِ الْمُلْك', 'to whom belongs the dominion', 'Surah Ghafir 40:16', "Limani l-mulk", {
    concept: 'Question words and Idafa can combine: لِمَنِ الْمُلْك asks "to whom belongs the dominion?" - لِمَن ("to whom") plus الْمُلْك ("the dominion"), a question built directly into a possessive structure.',
    quranRef: { surah: 40, ayah: 16, surahName: 'Ghafir' },
  }),
  simpleItem('Stage 12 review: questions', 'Review all the question words learned in this stage.', 'مَا شَأْنُكُم', 'what is your affair', 'a common Quranic question construction', "Ma sha'nukum", {
    concept: 'Review time: who, what, where, when, how, yes/no questions with هَلْ, and more practice with the Idafa possessive construction.',
  }),
];

// --- Stage 13: Pronouns & Past Tense Verbs (10 lessons) ---
const stage13Items = [
  simpleItem('Huwa: he', 'Learn the pronoun "he".', 'قُلْ هُوَ اللَّهُ أَحَد', 'Say: He is Allah, One', 'Surah Al-Ikhlas 112:1', 'Qul huwa Allahu ahad', {
    concept: 'هُوَ means "he" - and opens one of the most famous, most memorized verses in the Quran: قُلْ هُوَ اللَّهُ أَحَد, "Say: He is Allah, One".',
    quranRef: { surah: 112, ayah: 1, surahName: 'Al-Ikhlas' },
    comparisonSet: {
      intro: 'Compare "he" and "she".',
      items: [
        { arabic: 'هُوَ', transliteration: 'Huwa', translation: 'he', label: 'He' },
        { arabic: 'هِيَ', transliteration: 'Hiya', translation: 'she', label: 'She' },
      ],
    },
  }),
  simpleItem('Hiya: she', 'Learn the pronoun "she".', 'هِيَ', 'she', 'used throughout the Quran', 'Hiya', {
    concept: 'هِيَ means "she" - the feminine counterpart to هُوَ ("he").',
    comparisonSet: {
      intro: 'Compare "she" and "he".',
      items: [
        { arabic: 'هِيَ', transliteration: 'Hiya', translation: 'she', label: 'She' },
        { arabic: 'هُوَ', transliteration: 'Huwa', translation: 'he', label: 'He' },
      ],
    },
  }),
  simpleItem('Nahnu: we', 'Learn the pronoun "we", often used for Allah’s majesty.', 'إِنَّا نَحْنُ نَزَّلْنَا', 'indeed it is We who sent it down', 'Surah Al-Hijr 15:9', 'Inna nahnu nazzalna', {
    concept: 'نَحْنُ means "we" - and in the Quran is often used by Allah as the "royal We" to express majesty and power, as in "indeed it is We who sent it down".',
    quranRef: { surah: 15, ayah: 9, surahName: 'Al-Hijr' },
    comparisonSet: {
      intro: 'Compare "we" and "I".',
      items: [
        { arabic: 'نَحْنُ', transliteration: 'Nahnu', translation: 'we', label: 'We' },
        { arabic: 'أَنَا', transliteration: 'Ana', translation: 'I', label: 'I' },
      ],
    },
  }),
  simpleItem('Ana: I', 'Learn the pronoun "I".', 'إِنَّنِي أَنَا اللَّه', 'indeed, I am Allah', 'Surah Taha 20:14', 'Innani ana Allah', {
    concept: 'أَنَا means "I" - used when Allah speaks directly in the first person, as in "indeed, I am Allah".',
    quranRef: { surah: 20, ayah: 14, surahName: 'Taha' },
    comparisonSet: {
      intro: 'Compare "I" and "we".',
      items: [
        { arabic: 'أَنَا', transliteration: 'Ana', translation: 'I', label: 'I' },
        { arabic: 'نَحْنُ', transliteration: 'Nahnu', translation: 'we', label: 'We' },
      ],
    },
  }),
  simpleItem('Past tense: Kataba (wrote)', 'Learn the past-tense root for "to write".', 'كَتَبَ', 'he wrote', 'used throughout the Quran', 'Kataba', {
    concept: 'كَتَبَ means "he wrote" - this is the basic past-tense (perfect) form of the verb, the starting point every Arabic verb conjugation builds from.',
  }),
  simpleItem('Past tense: Dhahaba (went)', 'Learn the past-tense root for "to go".', 'ذَهَبَ', 'he went', 'Surah Yusuf 12:17', 'Dhahaba', {
    concept: 'ذَهَبَ means "he went" - another basic past-tense verb, following the same three-letter root pattern as كَتَبَ.',
    quranRef: { surah: 12, ayah: 17, surahName: 'Yusuf' },
  }),
  simpleItem('Past tense: Qara’a (read)', 'Learn the past-tense root for "to read/recite".', 'قَرَأَ', 'he read/recited', 'related to the word Quran itself', "Qara'a", {
    concept: 'قَرَأَ means "he read" or "he recited" - and its root is the very same root the word "Quran" (قُرْآن) comes from, since Quran literally means "the recitation".',
  }),
  simpleItem('Past tense: Khalaqa (created)', 'Learn the past-tense verb "he created".', 'خَلَقَ السَّمَاوَاتِ', 'He created the heavens', 'Surah Al-Anbya 21:30', 'Khalaqa s-samawat', {
    concept: 'خَلَقَ means "he created" - one of the most frequent verbs in the Quran, describing Allah\'s creation of everything.',
    quranRef: { surah: 21, ayah: 30, surahName: 'Al-Anbya' },
  }),
  simpleItem('Past tense conjugation: I/we', 'Learn how the verb ending changes for "I" and "we".', 'خَلَقْنَا', 'We created', 'Surah Al-Insan 76:2', 'Khalaqna', {
    concept: 'Arabic verbs change their ending depending on who\'s doing the action. خَلَقْنَا ("We created") adds نَا onto the root خَلَقَ - the same pattern any past-tense verb takes when the subject is "we".',
    quranRef: { surah: 76, ayah: 2, surahName: 'Al-Insan' },
  }),
  tajweedRuleItem('izhar', {
    arabicWord: 'مَنْ آمَنَ بِاللَّهِ',
    meaning: 'whoever believes in Allah',
    reference: 'Surah Al-Baqarah 2:62',
    transliteration: 'Man aamana billah',
    quranRef: { surah: 2, ayah: 62, surahName: 'Al-Baqarah' },
  }),
  tajweedRuleItem('iqlab', {
    arabicWord: 'مِن بَعْدِ مِيثَاقِهِ',
    meaning: 'from after its covenant',
    reference: 'Surah Al-Baqarah 2:27',
    transliteration: 'Mim ba’di mithaqihi',
    quranRef: { surah: 2, ayah: 27, surahName: 'Al-Baqarah' },
  }),
  simpleItem('Stage 13 review: pronouns & verbs', 'Review pronouns and past-tense verbs together.', 'إِيَّاكَ نَعْبُدُ', 'You alone we worship', 'Surah Al-Fatihah 1:5', "Iyyaka na'budu", {
    concept: 'Review time: he/she/we/I, and the past-tense verb pattern, all together in إِيَّاكَ نَعْبُدُ, "You alone we worship".',
    quranRef: { surah: 1, ayah: 5, surahName: 'Al-Fatihah' },
  }),
];

// --- Stage 14: Present Tense & Plurals (10 lessons) ---
const stage14Items = [
  simpleItem('Present tense: Ya‘lamu (he knows)', 'Learn the present-tense prefix ya-.', 'يَعْلَمُ', 'he knows', 'Surah Al-Hadid 57:4', "Ya'lamu", {
    concept: 'Present-tense verbs (happening now, or generally true) start with a prefix instead of an ending. يَعْلَمُ ("he knows") adds يَـ to the front of the root - a completely different pattern from the past tense you just learned.',
    quranRef: { surah: 57, ayah: 4, surahName: 'Al-Hadid' },
  }),
  simpleItem('Present tense: Yarzuqu (He provides)', 'See another present-tense verb describing Allah.', 'يَرْزُقُ', 'He provides', 'used throughout the Quran', 'Yarzuqu', {
    concept: 'يَرْزُقُ ("He provides") uses the same يَـ present-tense prefix, describing something Allah does continuously, not just once in the past.',
  }),
  simpleItem('Present tense: Na‘budu (we worship)', 'Learn the present-tense prefix na-.', 'نَعْبُدُ', 'we worship', 'Surah Al-Fatihah 1:5', "Na'budu", {
    concept: 'When "we" is the subject in the present tense, the prefix changes to نَـ instead of يَـ. نَعْبُدُ means "we worship" - opening the well-known verse "You alone we worship".',
    quranRef: { surah: 1, ayah: 5, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Present tense: Nasta‘een (we ask for help)', 'See the present tense used again in Al-Fatihah.', 'نَسْتَعِينُ', 'we ask for help', 'Surah Al-Fatihah 1:5', "Nasta'in", {
    concept: 'نَسْتَعِينُ ("we ask for help") uses the same نَـ prefix, appearing right alongside نَعْبُدُ in Surah Al-Fatihah.',
    quranRef: { surah: 1, ayah: 5, surahName: 'Al-Fatihah' },
  }),
  simpleItem('The imperative: Read!', 'Learn the command form, the very first Quranic revelation.', 'اقْرَأْ', 'Read!', 'Surah Al-Alaq 96:1', "Iqra'", {
    concept: 'The imperative is the command form of a verb - telling someone to do something right now. اقْرَأْ ("Read!") is especially significant: it\'s the very first word revealed of the entire Quran.',
    quranRef: { surah: 96, ayah: 1, surahName: 'Al-Alaq' },
  }),
  simpleItem('Broken plural: Prophets', 'See a broken (irregular) plural in practice.', 'أَنْبِيَاء', 'prophets (plural)', 'Surah An-Nisa 4:69', "Anbiya'", {
    concept: 'أَنْبِيَاء ("prophets") is a broken plural of نَبِيّ ("prophet") - the internal vowels change completely rather than just adding an ending, exactly like the broken plurals you met back in Stage 9.',
    quranRef: { surah: 4, ayah: 69, surahName: 'An-Nisa' },
    comparisonSet: {
      intro: 'Compare the singular and its broken plural.',
      items: [
        { arabic: 'نَبِيّ', transliteration: 'Nabi', translation: 'a prophet', label: 'Singular' },
        { arabic: 'أَنْبِيَاء', transliteration: "Anbiya'", translation: 'prophets', label: 'Broken plural' },
      ],
    },
  }),
  simpleItem('Broken plural: Worlds', 'See another broken plural pattern.', 'عَالَمِين', 'worlds (plural)', 'Surah Al-Fatihah 1:2', 'Alamin', {
    concept: 'عَالَمِين ("worlds") is another broken plural pattern, this time of عَالَم ("world") - notice the vowels shift again in a different way than أَنْبِيَاء did.',
    quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
    comparisonSet: {
      intro: 'Compare the singular and its broken plural.',
      items: [
        { arabic: 'عَالَم', transliteration: 'Aalam', translation: 'a world', label: 'Singular' },
        { arabic: 'عَالَمِين', transliteration: 'Alamin', translation: 'worlds', label: 'Broken plural' },
      ],
    },
  }),
  simpleItem('Negation: La (no)', 'Learn how "la" negates a present-tense verb.', 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْم', 'neither drowsiness nor sleep overtakes Him', 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', 'La ta’khudhuhu sinatun wa la nawm', {
    concept: 'لَا placed before a present-tense verb means "not" - لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْم means "neither drowsiness nor sleep overtakes Him", from the famous Ayat al-Kursi.',
    quranRef: { surah: 2, ayah: 255, surahName: 'Al-Baqarah' },
    comparisonSet: {
      intro: 'Compare negating a present-tense verb (لَا) with negating a past-tense one (لَمْ).',
      items: [
        { arabic: 'لَا تَأْخُذُهُ', transliteration: 'La ta’khudhuhu', translation: 'it does not overtake Him', label: 'Lā + present tense' },
        { arabic: 'لَمْ يَلِدْ', transliteration: 'Lam yalid', translation: 'he did not beget', label: 'Lam + past-form verb' },
      ],
    },
  }),
  simpleItem('Negation: Lam (did not)', 'Learn how "lam" negates a verb in the past.', 'لَمْ يَلِدْ وَلَمْ يُولَد', 'He neither begets nor is born', 'Surah Al-Ikhlas 112:3', 'Lam yalid wa lam yulad', {
    concept: 'لَمْ negates a verb in the past tense instead - and slightly changes the verb\'s ending too. لَمْ يَلِدْ وَلَمْ يُولَد means "He neither begets nor is born".',
    quranRef: { surah: 112, ayah: 3, surahName: 'Al-Ikhlas' },
    comparisonSet: {
      intro: 'Compare negating a past-form verb (لَمْ) with negating a present-tense one (لَا).',
      items: [
        { arabic: 'لَمْ يَلِدْ', transliteration: 'Lam yalid', translation: 'he did not beget', label: 'Lam + past-form verb' },
        { arabic: 'لَا تَأْخُذُهُ', transliteration: 'La ta’khudhuhu', translation: 'it does not overtake Him', label: 'Lā + present tense' },
      ],
    },
  }),
  tajweedRuleItem('meem-sakinah', {
    arabicWord: 'تَرْمِيهِم بِحِجَارَةٍ',
    meaning: 'striking them with stones',
    reference: 'Surah Al-Fil 105:4',
    transliteration: 'Tarmeehim bi hijaratin',
    quranRef: { surah: 105, ayah: 4, surahName: 'Al-Fil' },
  }),
  simpleItem('Stage 14 review: present tense', 'Review present-tense verbs, plurals, and negation.', 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَد', 'nor is there to Him any equivalent', 'Surah Al-Ikhlas 112:4', 'Wa lam yakun lahu kufuwan ahad', {
    concept: 'Review time: present-tense verbs, the imperative command form, broken plurals, and negating both present- and past-tense verbs.',
    quranRef: { surah: 112, ayah: 4, surahName: 'Al-Ikhlas' },
  }),
];

// --- Stage 15: Complex Sentences & Quranic Patterns (10 lessons, reading Al-Fatihah in full) ---
const readingItem = (title, arabicWord, meaning, reference, transliteration, quranRef) =>
  simpleItem(title, `Read ${title} word by word and understand its meaning.`, arabicWord, meaning, reference, transliteration, {
    type: 'reading',
    concept: 'Read the verse below word by word, then check your understanding.',
    quranRef,
  });
const stage15Items = [
  readingItem('Al-Fatihah, Ayah 1', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:1', 'Bismillahi r-Rahmani r-Rahim', { surah: 1, ayah: 1, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 2', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'All praise is due to Allah, Lord of the worlds.', 'Surah Al-Fatihah 1:2', 'Alhamdulillahi Rabbi l-alamin', { surah: 1, ayah: 2, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 3', 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:3', 'Ar-Rahmani r-Rahim', { surah: 1, ayah: 3, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 4', 'مَالِكِ يَوْمِ الدِّينِ', 'Master of the Day of Judgement.', 'Surah Al-Fatihah 1:4', 'Maliki yawmi d-din', { surah: 1, ayah: 4, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 5', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'You alone we worship, and You alone we ask for help.', 'Surah Al-Fatihah 1:5', "Iyyaka na'budu wa iyyaka nasta'in", { surah: 1, ayah: 5, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 6', 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path.', 'Surah Al-Fatihah 1:6', 'Ihdina s-sirata l-mustaqim', { surah: 1, ayah: 6, surahName: 'Al-Fatihah' }),
  readingItem('Al-Fatihah, Ayah 7', 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', 'The path of those You have blessed.', 'Surah Al-Fatihah 1:7', 'Sirata lladhina an’amta alayhim', { surah: 1, ayah: 7, surahName: 'Al-Fatihah' }),
  simpleItem('Conditional: In (if)', 'Learn how "in" introduces a possible condition.', 'إِن تَعُدُّوا', 'if you count', 'Surah Ibrahim 14:34', "In ta'uddu", {
    concept: 'إِن introduces a possible, real condition - "if this happens, then...". إِن تَعُدُّوا means "if you count", opening a verse about the many blessings of Allah.',
    quranRef: { surah: 14, ayah: 34, surahName: 'Ibrahim' },
    comparisonSet: {
      intro: 'Compare a real, possible condition (إِن) with a hypothetical one (لَوْ).',
      items: [
        { arabic: 'إِن تَعُدُّوا', transliteration: "In ta'uddu", translation: 'if you count', label: 'In = real condition' },
        { arabic: 'لَوْ كَانَ', transliteration: 'Law kana', translation: 'if there were', label: 'Law = hypothetical' },
      ],
    },
  }),
  simpleItem('Conditional: Law (if, hypothetical)', 'Learn how "law" introduces a hypothetical condition.', 'لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّه', 'if there were gods besides Allah', 'Surah Al-Anbya 21:22', 'Law kana fihima alihatun illallah', {
    concept: 'لَوْ introduces a hypothetical or unlikely condition - different from إِن, which is for real possibilities. لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّه means "if there were gods besides Allah" - a hypothetical used to prove there is only One.',
    quranRef: { surah: 21, ayah: 22, surahName: 'Al-Anbya' },
    comparisonSet: {
      intro: 'Compare a hypothetical condition (لَوْ) with a real, possible one (إِن).',
      items: [
        { arabic: 'لَوْ كَانَ', transliteration: 'Law kana', translation: 'if there were', label: 'Law = hypothetical' },
        { arabic: 'إِن تَعُدُّوا', transliteration: "In ta'uddu", translation: 'if you count', label: 'In = real condition' },
      ],
    },
  }),
  tajweedRuleItem('madd-aarid', {
    arabicWord: 'الْعَالَمِينَ',
    meaning: 'the worlds',
    reference: 'Surah Al-Fatihah 1:2 (stopping at the end of the ayah)',
    transliteration: "Al-'aalameen",
    quranRef: { surah: 1, ayah: 2, surahName: 'Al-Fatihah' },
  }),
  simpleItem('Stage 15 review: Al-Fatihah', 'Review all seven ayahs of Al-Fatihah together.', 'وَلَا الضَّالِّين', 'nor of those who are astray', 'Surah Al-Fatihah 1:7', 'Wa la d-dallin', {
    concept: 'Review time: you\'ve now read all seven ayahs of Al-Fatihah, plus the two conditional words in and law.',
    quranRef: { surah: 1, ayah: 7, surahName: 'Al-Fatihah' },
  }),
];

// --- Stage 16: Fluency & Quranic Application (Capstone) (10 lessons) ---
const stage16Items = [
  readingItem('Al-Ikhlas, Ayah 1-2', 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ', 'Say: He is Allah, One. Allah, the Eternal Refuge.', 'Surah Al-Ikhlas 112:1-2', 'Qul huwa Allahu ahad, Allahu s-samad', { surah: 112, ayah: 1, surahName: 'Al-Ikhlas' }),
  readingItem('Al-Ikhlas, Ayah 3-4', 'لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', 'He neither begets nor is born, nor is there any equivalent to Him.', 'Surah Al-Ikhlas 112:3-4', 'Lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', { surah: 112, ayah: 3, surahName: 'Al-Ikhlas' }),
  readingItem('An-Nas, Ayah 1', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Say: I seek refuge in the Lord of mankind.', 'Surah An-Nas 114:1', "Qul a'udhu bi Rabbi n-nas", { surah: 114, ayah: 1, surahName: 'An-Nas' }),
  readingItem('Al-Falaq, Ayah 1', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Say: I seek refuge in the Lord of the daybreak.', 'Surah Al-Falaq 113:1', "Qul a'udhu bi Rabbi l-falaq", { surah: 113, ayah: 1, surahName: 'Al-Falaq' }),
  simpleItem('The root system: K-T-B', 'See how kataba (wrote), kitab (book), and maktabah (library) share one root.', 'مَكْتَبَة', 'library', 'built on the same root as kitab (book) and kataba (wrote)', 'Maktabah', {
    concept: 'Arabic words are built from 3-letter roots that carry a core meaning. ك ت ب carries the idea of "writing": كَتَبَ (he wrote), كِتَاب (book), and مَكْتَبَة (library) all share this same root.',
  }),
  simpleItem('The root system: A-L-M', 'See how ‘ilm (knowledge) and ‘alim (scholar) share one root.', 'عَالِم', 'scholar', 'Surah Fatir 35:28, "only those of knowledge fear Allah among His servants"', 'Alim', {
    concept: 'The root ع ل م carries the idea of "knowledge": عِلْم (knowledge), عَالِم (a knowledgeable person, a scholar), and عَالَمِين (the worlds - that which makes Allah known) all come from this one root.',
    quranRef: { surah: 35, ayah: 28, surahName: 'Fatir' },
  }),
  simpleItem('Classical vs Modern Arabic', 'Understand that the Quran preserved Classical Arabic for 1400+ years.', 'فُصْحَى', 'classical/formal Arabic', 'the register in which the Quran was revealed', 'Fusha', {
    concept: 'The Quran was revealed in فُصْحَى, Classical Arabic - the same formal register still used in writing, news, and religious study across the Arab world today, even though everyday spoken dialects vary a lot from country to country.',
  }),
  simpleItem('Tajweed terms: Makki & Madani', 'Learn how surahs are classified by where they were revealed.', 'مَكِّيَّة', 'Meccan (revealed in Makkah)', 'a classification used for every surah of the Quran', 'Makkiyyah', {
    concept: 'Every surah of the Quran is classified as either مَكِّيَّة (Meccan, revealed before the migration to Madinah) or مَدَنِيَّة (Medinan, revealed after) - this affects the surah\'s themes and length, and scholars have carefully documented which is which.',
    comparisonSet: {
      intro: 'Compare the two classifications every surah falls into.',
      items: [
        { arabic: 'مَكِّيَّة', transliteration: 'Makkiyyah', translation: 'Meccan', label: 'Revealed before the migration' },
        { arabic: 'مَدَنِيَّة', transliteration: 'Madaniyyah', translation: 'Medinan', label: 'Revealed after the migration' },
      ],
    },
  }),
  tajweedRuleItem('qalqalah-kubra', {
    arabicWord: 'الْفَلَقِ',
    meaning: 'the daybreak',
    reference: 'Surah Al-Falaq 113:1 (stopping at the end of the ayah)',
    transliteration: 'Al-falaq',
    quranRef: { surah: 113, ayah: 1, surahName: 'Al-Falaq' },
  }),
  tajweedRuleItem('waqf', {
    arabicWord: 'أَحَدٌ',
    meaning: 'One',
    reference: 'Surah Al-Ikhlas 112:1 (a natural stopping point)',
    transliteration: 'Ahad',
    quranRef: { surah: 112, ayah: 1, surahName: 'Al-Ikhlas' },
  }),
  simpleItem('Reading comprehension', 'Apply everything learned to a short new passage.', 'وَالْعَصْرِ', 'By time', 'Surah Al-Asr 103:1', 'Wal-Asr', {
    concept: 'Let\'s bring everything together: read a short new surah you haven\'t seen lesson-by-lesson before, and see how much you can now understand on your own.',
    quranRef: { surah: 103, ayah: 1, surahName: 'Al-Asr' },
  }),
  simpleItem('Capstone: Your Arabic & Quran Journey', 'Celebrate finishing the full 16-stage ArabiKids journey.', 'رَبِّ زِدْنِي عِلْمًا', 'My Lord, increase me in knowledge', 'Surah Taha 20:114', 'Rabbi zidni ilma', {
    type: 'capstone',
    concept: 'You’ve learned letters, harakat, vocabulary, grammar, and now you can read real Quranic verses. This dua asks Allah for even more knowledge as your journey continues.',
    quranRef: { surah: 20, ayah: 114, surahName: 'Taha' },
  }),
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
