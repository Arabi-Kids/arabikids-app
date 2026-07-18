// Seeds the Supabase project with 45 Junior (ages 3-7, Noorania-Qaida-style phonics)
// + 45 Explorer (ages 8-17, Madinah Arabic Book 1) lessons = 90 total.
// 5 free + 40 paid per age group. Every single lesson links its Arabic word/phrase
// to a real Quranic verse or name, per the "Arabic and Quran taught together" model.
//
// Ported from the old backend/db/seed.js (mysql2) to @supabase/supabase-js,
// using the service role key so it bypasses RLS.
//
// NOTE: Quranic references/translations here are simplified for a children's curriculum
// seed and should be reviewed by a qualified Arabic/Islamic studies scholar before
// production launch.
//
// Usage: node supabase/seed.mjs   (reads SUPABASE_URL + SUPABASE_SERVICE_KEY from env)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

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
// JUNIOR (ages 3-7): 28 letters + 5 harakat + 4 colors + 4 numbers + 4 family = 45
// ---------------------------------------------------------------------------

const JUNIOR_LETTERS = [
  ['ا', 'alif', 'اللّٰه', 'Allah', 'used throughout the Quran'],
  ['ب', 'baa', 'بِسْمِ', 'in the name of', 'Surah Al-Fatihah 1:1'],
  ['ت', 'taa', 'تَبَارَكَ', 'blessed is He', 'Surah Al-Mulk 67:1'],
  ['ث', 'thaa', 'ثَبَات', 'steadfastness', 'a quality asked for in dua'],
  ['ج', 'jeem', 'جَنَّة', 'Paradise', 'mentioned throughout the Quran'],
  ['ح', 'haa', 'حَمْد', 'praise', 'Surah Al-Fatihah 1:2'],
  ['خ', 'khaa', 'خَالِق', 'the Creator', 'a name of Allah'],
  ['د', 'daal', 'دِين', 'religion / way of life', 'Surah Al-Fatihah 1:4'],
  ['ذ', 'dhaal', 'ذِكْر', 'remembrance', 'remembrance of Allah'],
  ['ر', 'raa', 'رَحْمَٰن', 'Most Merciful', 'Surah Al-Fatihah 1:3'],
  ['ز', 'zaay', 'زَكَاة', 'purifying charity', 'a pillar of Islam'],
  ['س', 'seen', 'سَلَام', 'peace', 'a name of Allah and Islamic greeting'],
  ['ش', 'sheen', 'شُكْر', 'gratitude', 'being thankful to Allah'],
  ['ص', 'saad', 'صِرَاط', 'the path', 'Surah Al-Fatihah 1:6'],
  ['ض', 'daad', 'ضُحَى', 'morning brightness', 'Surah Ad-Duha 93:1'],
  ['ط', 'taa (heavy)', 'طه', 'Taha', 'opening letters of Surah Taha 20:1'],
  ['ظ', 'dhaa (heavy)', 'ظُلْم', 'wrongdoing', 'what Allah warns against'],
  ['ع', 'ayn', 'عَالَمِين', 'all the worlds', 'Surah Al-Fatihah 1:2'],
  ['غ', 'ghayn', 'غَفُور', 'Most Forgiving', 'a name of Allah'],
  ['ف', 'faa', 'فَاتِحَة', 'the opening', 'the first surah of the Quran'],
  ['ق', 'qaaf', 'قُرْآن', 'the recitation', 'the final revelation'],
  ['ك', 'kaaf', 'كِتَاب', 'book', 'often refers to the Quran'],
  ['ل', 'laam', 'لُطْف', 'gentleness', 'a quality of Allah'],
  ['م', 'meem', 'مَلِك', 'King / Sovereign', 'Surah Al-Fatihah 1:4'],
  ['ن', 'noon', 'نُور', 'light', 'Surah An-Nur 24:35'],
  ['ه', 'haa (light)', 'هُدَى', 'guidance', 'Surah Al-Fatihah 1:6'],
  ['و', 'waaw', 'وَحْدَه', 'Him alone', 'La ilaha illa Allah wahdahu'],
  ['ي', 'yaa', 'يَوْم', 'day', 'Surah Al-Fatihah 1:4'],
];

const JUNIOR_HARAKAT = [
  ['فَتْحَة (Fatha)', 'a short "a" sound, as in the بَ of تَبَارَكَ', 'بَ', 'the "ba" sound', 'Surah Al-Mulk 67:1'],
  ['كَسْرَة (Kasra)', 'a short "i" sound, as in the بِ of بِسْمِ', 'بِ', 'the "bi" sound', 'Surah Al-Fatihah 1:1'],
  ['ضَمَّة (Damma)', 'a short "u" sound, as in the هُ of هُدَى', 'هُ', 'the "hu" sound', 'Surah Al-Fatihah 1:6'],
  ['تَنْوِين (Tanween)', 'a doubled ending sound, as in سَلَامٌ', 'سَلَامٌ', 'peace (indefinite)', 'Surah Al-Qadr 97:5'],
  ['شَدَّة وسُكُون (Shaddah & Sukoon)', 'a doubled letter and a silent letter, as in اللّٰه', 'اللّٰه', 'Allah', 'used throughout the Quran'],
];

const JUNIOR_COLORS = [
  ['Yellow', 'أَصْفَر', 'yellow', 'Surah Al-Baqarah 2:69, describing a bright yellow cow'],
  ['White', 'أَبْيَض', 'white', 'Surah Fatir 35:27, describing white mountain streaks'],
  ['Green', 'أَخْضَر', 'green', 'Surah Al-Insan 76:21, the green garments of Paradise'],
  ['Black', 'أَسْوَد', 'black', 'Surah Fatir 35:27, describing black mountain streaks'],
];

const JUNIOR_NUMBERS = [
  ['Numbers 1-3', 'وَاحِد', 'one', 'Surah Al-Ikhlas 112:1, "Qul huwa Allahu ahad"'],
  ['Numbers 4-6', 'سِتَّة', 'six', "Surah Al-A'raf 7:54, heavens and earth in six days"],
  ['Numbers 7-9', 'سَبْع', 'seven', 'Surah Al-Hijr 15:87, "the seven oft-repeated verses"'],
  ['Number 10', 'عَشْر', 'ten', 'Surah Al-Fajr 89:2, "by the ten nights"'],
];

const JUNIOR_FAMILY = [
  ['Father', 'أَب', 'father', 'Surah Yusuf 12:4, Yusuf speaking to his father'],
  ['Mother', 'أُمّ', 'mother', 'Surah Al-Qasas 28:7, the mother of Musa'],
  ['Son / Child', 'اِبْن', 'son', 'Surah Maryam 19:34, "Isa, the son of Maryam"'],
  ['Brother', 'أَخ', 'brother', 'Surah Yusuf 12:8, the brothers of Yusuf'],
];

const JUNIOR_ALL_MEANINGS = [
  ...JUNIOR_LETTERS.map((l) => l[3]),
  ...JUNIOR_COLORS.map((c) => c[2]),
  ...JUNIOR_NUMBERS.map((n) => n[2]),
  ...JUNIOR_FAMILY.map((f) => f[2]),
];
const JUNIOR_ALL_REFERENCES = [
  ...JUNIOR_LETTERS.map((l) => l[4]),
  ...JUNIOR_HARAKAT.map((h) => h[4]),
  ...JUNIOR_COLORS.map((c) => c[3]),
  ...JUNIOR_NUMBERS.map((n) => n[3]),
  ...JUNIOR_FAMILY.map((f) => f[3]),
];

function juniorExercises({ conceptLabel, conceptPool, arabicWord, meaning, reference }) {
  return [
    {
      title: 'Word Meaning',
      instruction: `What does "${arabicWord}" mean?`,
      options: shuffle([meaning, ...pickDistractors(JUNIOR_ALL_MEANINGS, meaning, 3)]),
      correct_answer: meaning,
      explanation: `"${arabicWord}" means "${meaning}".`,
    },
    {
      title: 'Concept Check',
      instruction: `This lesson is about:`,
      options: shuffle([conceptLabel, ...pickDistractors(conceptPool, conceptLabel, 3)]),
      correct_answer: conceptLabel,
      explanation: `This lesson teaches: ${conceptLabel}.`,
    },
    {
      title: 'Quran Connection',
      instruction: `Where do we find "${arabicWord}" connected to the Quran?`,
      options: shuffle([reference, ...pickDistractors(JUNIOR_ALL_REFERENCES, reference, 3)]),
      correct_answer: reference,
      explanation: `"${arabicWord}" connects to ${reference}.`,
    },
  ];
}

function buildJuniorLessons() {
  const lessons = [];
  let num = 0;
  const letterLabels = JUNIOR_LETTERS.map(([letter]) => letter);

  JUNIOR_LETTERS.forEach(([letter, name, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'junior',
      lesson_number: num,
      title: `Letter ${letter} (${name})`,
      lesson_goal: `Recognise the letter ${letter} and see it inside a real Quranic word.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 8,
      content: {
        type: 'letter',
        concept: `Learn to recognise, sound out and write the letter ${letter} (${name}).`,
        letter,
        transliteration: name,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `"${word}" (${meaning}) is found in ${reference}.` },
      },
      exercises: juniorExercises({ conceptLabel: letter, conceptPool: letterLabels, arabicWord: word, meaning, reference }),
    });
  });

  const harakatLabels = JUNIOR_HARAKAT.map(([title]) => title);
  JUNIOR_HARAKAT.forEach(([title, desc, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'junior',
      lesson_number: num,
      title,
      lesson_goal: `Learn the ${title.split(' ')[0]} vowel mark and hear it in a Quranic word.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 8,
      content: {
        type: 'harakat',
        concept: desc,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `Hear this vowel mark in "${word}" from ${reference}.` },
      },
      exercises: juniorExercises({ conceptLabel: title, conceptPool: harakatLabels, arabicWord: word, meaning, reference }),
    });
  });

  const colorLabels = JUNIOR_COLORS.map(([label]) => label);
  JUNIOR_COLORS.forEach(([label, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'junior',
      lesson_number: num,
      title: `Colour: ${label}`,
      lesson_goal: `Learn the colour ${label.toLowerCase()} and where it appears in the Quran.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 8,
      content: {
        type: 'color',
        concept: `The Arabic word for ${label.toLowerCase()} is ${word}.`,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `${reference}.` },
      },
      exercises: juniorExercises({ conceptLabel: label, conceptPool: colorLabels, arabicWord: word, meaning, reference }),
    });
  });

  const numberLabels = JUNIOR_NUMBERS.map(([label]) => label);
  JUNIOR_NUMBERS.forEach(([label, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'junior',
      lesson_number: num,
      title: label,
      lesson_goal: `Learn ${label.toLowerCase()} and how numbers appear in the Quran.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 8,
      content: {
        type: 'number',
        concept: `${label}: focus word ${word} ("${meaning}").`,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `${reference}.` },
      },
      exercises: juniorExercises({ conceptLabel: label, conceptPool: numberLabels, arabicWord: word, meaning, reference }),
    });
  });

  const familyLabels = JUNIOR_FAMILY.map(([label]) => label);
  JUNIOR_FAMILY.forEach(([label, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'junior',
      lesson_number: num,
      title: `Family: ${label}`,
      lesson_goal: `Learn the word for "${label.toLowerCase()}" and meet this word in the Quran.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 8,
      content: {
        type: 'family',
        concept: `The Arabic word for ${label.toLowerCase()} is ${word}.`,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `${reference}.` },
      },
      exercises: juniorExercises({ conceptLabel: label, conceptPool: familyLabels, arabicWord: word, meaning, reference }),
    });
  });

  return lessons;
}

// ---------------------------------------------------------------------------
// EXPLORER (ages 8-17): 10 vocab + 25 grammar/conjugation + 10 Quran reading = 45
// ---------------------------------------------------------------------------

const EXPLORER_VOCAB = [
  ['Family', 'أَب', 'father', 'Surah Yusuf 12:4'],
  ['Colours', 'أَصْفَر', 'yellow', 'Surah Al-Baqarah 2:69'],
  ['Animals', 'نَمْلَة', 'ant', 'Surah An-Naml 27:18'],
  ['Numbers', 'سَبْع', 'seven', 'Surah Al-Hijr 15:87'],
  ['Greetings', 'سَلَام', 'peace', "Surah Al-An'am 6:54"],
  ['Body Parts', 'قَلْب', 'heart', "Surah Ash-Shu'ara 26:89"],
  ['Food', 'عَسَل', 'honey', 'Surah An-Nahl 16:69'],
  ['Nature & Weather', 'رِيح', 'wind', 'Surah Ar-Rum 30:46'],
  ['Home', 'بَيْت', "house (the Ka'bah)", 'Surah Al-Baqarah 2:125'],
  ['Time', 'يَوْم', 'day', 'Surah Al-Fatihah 1:4'],
];

const EXPLORER_GRAMMAR = [
  ['Nouns and the definite article (ال)', 'الْحَمْدُ', 'the praise', 'Surah Al-Fatihah 1:2'],
  ['Gender: masculine and feminine nouns', 'مُسْلِمَة', 'a Muslim woman', 'Surah Al-Ahzab 33:35'],
  ['Singular, dual and plural', 'السَّمَاوَات', 'the heavens (plural)', 'Surah Al-Baqarah 2:29'],
  ['Demonstrative pronouns (هذا / ذلك)', 'ذَٰلِكَ الْكِتَابُ', 'that is the Book', 'Surah Al-Baqarah 2:2'],
  ['The idaafah (possessive) construction', 'رَبِّ الْعَالَمِينَ', 'Lord of the worlds', 'Surah Al-Fatihah 1:2'],
  ['Personal pronouns (أنا، أنت، هو، هي)', 'إِيَّاكَ نَعْبُدُ', 'You alone we worship', 'Surah Al-Fatihah 1:5'],
  ['Simple nominal sentences (الجملة الاسمية)', 'اللَّهُ نُورُ السَّمَاوَاتِ', 'Allah is the Light of the heavens', 'Surah An-Nur 24:35'],
  ['Prepositions of place (في، على)', 'فِي قُلُوبِهِم', 'in their hearts', 'Surah Al-Baqarah 2:10'],
  ['Question words (من، ما، أين)', 'مَن ذَا الَّذِي', 'who is the one who', 'Surah Al-Baqarah 2:255'],
  ['Simple verbal sentences (الجملة الفعلية)', 'خَلَقَ السَّمَاوَاتِ', 'He created the heavens', 'Surah Al-Anbya 21:30'],
  ['Verb conjugation: past tense (هو/هي)', 'خَلَقَ', 'he created', "Surah Al-A'raf 7:189"],
  ['Verb conjugation: past tense (أنا/نحن)', 'خَلَقْنَا', 'We created', 'Surah Al-Insan 76:2'],
  ['Verb conjugation: present tense (هو/هي)', 'يَعْلَمُ', 'he knows', 'Surah Al-Hadid 57:4'],
  ['Verb conjugation: present tense (أنا/نحن)', 'نَعْبُدُ', 'we worship', 'Surah Al-Fatihah 1:5'],
  ['The imperative (command) form', 'اقْرَأْ', 'Read!', 'Surah Al-Alaq 96:1'],
  ['Adjectives and noun-adjective agreement', 'الرَّحْمَٰنِ الرَّحِيمِ', 'the Most Merciful, the Especially Merciful', 'Surah Al-Fatihah 1:3'],
  ['Numbers 11-20', 'عَشْرٌ كَامِلَة', 'ten complete', 'Surah Al-Baqarah 2:196'],
  ['Days of the week', 'يَوْمَ الْجُمُعَةِ', 'the day of Friday', "Surah Al-Jumu'ah 62:9"],
  ['Months and the Islamic calendar', 'شَهْرُ رَمَضَان', 'the month of Ramadan', 'Surah Al-Baqarah 2:185'],
  ['Telling the time', 'السَّاعَة', 'the Hour', 'Surah Al-Qamar 54:1'],
  ['Connecting sentences with و and ف', 'وَالْعَصْرِ', 'by time / the age', 'Surah Al-Asr 103:1'],
  ['Sun letters and moon letters', 'الشَّمْس / الْقَمَر', 'the sun / the moon', 'Surah Ash-Shams 91:1, Surah Al-Qamar 54:1'],
  ['The broken plural (جمع التكسير)', 'أَنْبِيَاء', 'prophets (plural)', 'Surah An-Nisa 4:69'],
  ['Attached pronouns (ي، ك، ه)', 'رَبِّي / رَبُّكَ', 'my Lord / your Lord', 'used throughout the Quran'],
  ['Question formation with هل and أ', 'هَلْ أَتَاكَ', 'has there come to you', 'Surah Al-Ghashiyah 88:1'],
];

const EXPLORER_READING = [
  ['Al-Fatihah, Ayah 1', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:1'],
  ['Al-Fatihah, Ayah 2', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'All praise is due to Allah, Lord of the worlds.', 'Surah Al-Fatihah 1:2'],
  ['Al-Fatihah, Ayah 3', 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Most Gracious, the Most Merciful.', 'Surah Al-Fatihah 1:3'],
  ['Al-Fatihah, Ayah 4', 'مَالِكِ يَوْمِ الدِّينِ', 'Master of the Day of Judgement.', 'Surah Al-Fatihah 1:4'],
  ['Al-Fatihah, Ayah 5', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'You alone we worship, and You alone we ask for help.', 'Surah Al-Fatihah 1:5'],
  ['Al-Fatihah, Ayah 6', 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path.', 'Surah Al-Fatihah 1:6'],
  ['Al-Fatihah, Ayah 7', 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', 'The path of those You have blessed.', 'Surah Al-Fatihah 1:7'],
  ['Al-Ikhlas, Ayah 1-2', 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ', 'Say: He is Allah, One. Allah, the Eternal Refuge.', 'Surah Al-Ikhlas 112:1-2'],
  ['Al-Ikhlas, Ayah 3-4', 'لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', 'He neither begets nor is born, nor is there any equivalent to Him.', 'Surah Al-Ikhlas 112:3-4'],
  ['An-Nas, Ayah 1', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Say: I seek refuge in the Lord of mankind.', 'Surah An-Nas 114:1'],
];

const EXPLORER_ALL_MEANINGS = [...EXPLORER_VOCAB.map((v) => v[2]), ...EXPLORER_GRAMMAR.map((g) => g[2])];
const EXPLORER_ALL_REFERENCES = [
  ...EXPLORER_VOCAB.map((v) => v[3]),
  ...EXPLORER_GRAMMAR.map((g) => g[3]),
  ...EXPLORER_READING.map((r) => r[3]),
];

function explorerExercises({ conceptLabel, conceptPool, arabicWord, meaning, reference }) {
  return [
    {
      title: 'Word / Phrase Meaning',
      instruction: `What does "${arabicWord}" mean?`,
      options: shuffle([meaning, ...pickDistractors(EXPLORER_ALL_MEANINGS, meaning, 3)]),
      correct_answer: meaning,
      explanation: `"${arabicWord}" means "${meaning}".`,
    },
    {
      title: 'Concept Check',
      instruction: `This lesson mainly teaches:`,
      options: shuffle([conceptLabel, ...pickDistractors(conceptPool, conceptLabel, 3)]),
      correct_answer: conceptLabel,
      explanation: `This lesson focuses on: ${conceptLabel}.`,
    },
    {
      title: 'Quran Connection',
      instruction: `Where is "${arabicWord}" found in the Quran?`,
      options: shuffle([reference, ...pickDistractors(EXPLORER_ALL_REFERENCES, reference, 3)]),
      correct_answer: reference,
      explanation: `"${arabicWord}" (${meaning}) is found in ${reference}.`,
    },
  ];
}

function buildExplorerLessons() {
  const lessons = [];
  let num = 0;

  const vocabLabels = EXPLORER_VOCAB.map(([theme]) => theme);
  EXPLORER_VOCAB.forEach(([theme, word, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'explorer',
      lesson_number: num,
      title: `Vocabulary: ${theme}`,
      lesson_goal: `Build vocabulary around ${theme.toLowerCase()} and see it used in the Quran.`,
      arabic_word: word,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 12,
      content: {
        type: 'vocabulary',
        concept: `Key word for ${theme}: ${word} ("${meaning}").`,
        quranicConnection: { arabic: word, translation: meaning, reference, note: `${reference}.` },
      },
      exercises: explorerExercises({ conceptLabel: theme, conceptPool: vocabLabels, arabicWord: word, meaning, reference }),
    });
  });

  const grammarLabels = EXPLORER_GRAMMAR.map(([topic]) => topic);
  EXPLORER_GRAMMAR.forEach(([topic, phrase, meaning, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'explorer',
      lesson_number: num,
      title: topic,
      lesson_goal: `Understand ${topic.toLowerCase()} and see it in a real Quranic phrase.`,
      arabic_word: phrase,
      arabic_word_meaning: meaning,
      is_free: num <= 5,
      estimated_minutes: 15,
      content: {
        type: 'grammar',
        concept: `Grammar focus: ${topic}. Example from the Quran: ${phrase} ("${meaning}").`,
        quranicConnection: { arabic: phrase, translation: meaning, reference, note: `${reference}.` },
      },
      exercises: explorerExercises({ conceptLabel: topic, conceptPool: grammarLabels, arabicWord: phrase, meaning, reference }),
    });
  });

  const readingLabels = EXPLORER_READING.map(([title]) => title);
  EXPLORER_READING.forEach(([title, passage, translation, reference]) => {
    num += 1;
    lessons.push({
      age_group: 'explorer',
      lesson_number: num,
      title: `Reading: ${title}`,
      lesson_goal: `Read ${title} word by word and understand its meaning.`,
      arabic_word: passage,
      arabic_word_meaning: translation,
      is_free: num <= 5,
      estimated_minutes: 15,
      content: {
        type: 'reading',
        concept: 'Read the verse below word by word, then check your understanding.',
        passage,
        translation,
        quranicConnection: { arabic: passage, translation, reference, note: `${reference}.` },
      },
      exercises: explorerExercises({ conceptLabel: title, conceptPool: readingLabels, arabicWord: passage, meaning: translation, reference }),
    });
  });

  return lessons;
}

async function seed() {
  console.log('Clearing existing lesson data...');
  await supabase.from('exercises').delete().neq('id', 0);
  await supabase.from('user_progress').delete().neq('id', 0);
  await supabase.from('lessons').delete().neq('id', 0);

  const allLessons = [...buildJuniorLessons(), ...buildExplorerLessons()];
  console.log(`Seeding ${allLessons.length} lessons...`);

  for (const lesson of allLessons) {
    const { exercises, ...lessonRow } = lesson;
    const { data: inserted, error: lessonError } = await supabase
      .from('lessons')
      .insert(lessonRow)
      .select('id')
      .single();

    if (lessonError) {
      throw new Error(`Failed to insert lesson "${lesson.title}": ${lessonError.message}`);
    }

    const exerciseRows = exercises.map((ex, i) => ({
      lesson_id: inserted.id,
      exercise_number: i + 1,
      title: ex.title,
      instruction: ex.instruction,
      options: ex.options,
      correct_answer: ex.correct_answer,
      explanation: ex.explanation,
    }));

    const { error: exerciseError } = await supabase.from('exercises').insert(exerciseRows);
    if (exerciseError) {
      throw new Error(`Failed to insert exercises for "${lesson.title}": ${exerciseError.message}`);
    }
  }

  console.log(`Seed complete: ${allLessons.length} lessons.`);

  console.log('Seeding admin user (email: admin@arabikids.com / password: Admin123!)...');
  const ADMIN_EMAIL = 'admin@arabikids.com';
  const ADMIN_PASSWORD = 'Admin123!';

  let adminUserId;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'ArabiKids Admin', age_group: 'junior' },
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

  // handle_new_user() trigger already inserted a public.users row with role='parent'; promote it.
  const { error: promoteError } = await supabase
    .from('users')
    .update({ role: 'admin', subscription_status: 'active' })
    .eq('id', adminUserId);

  if (promoteError) {
    throw new Error(`Failed to promote admin user: ${promoteError.message}`);
  }

  console.log('Admin user ready.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
