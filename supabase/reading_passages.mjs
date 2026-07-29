// Content for the Stage Review Hub's "Read" tab - 2 short passages per stage,
// built ONLY from words/phrases that stage (or an earlier one) already
// teaches. These are original reading-practice compositions, not new Quranic
// citations - Stages 1-8 read as sequences of already-known words/phrases
// (matching how little standalone grammar exists that early); Stage 9
// onward, once real grammar (definite article, demonstratives, pronouns,
// verbs, negation, conditionals) has been introduced, passages become real
// short sentences, occasionally reusing a pronoun/particle from an earlier
// stage the same way a child's own reading naturally accumulates.
//
// Keyed by stage key (stage1..stage16), synced into `stage_reading_passages`
// by supabase/sync_reading_passages.mjs (matches stages.order_index).

export const READING_PASSAGES = {
  stage1: [
    { text_content: 'جَنَّة ضُحَى زَكَاة', translation: 'Paradise - morning brightness - purifying charity' },
    { text_content: 'اللّٰه خَالِق', translation: 'Allah is the Creator.' },
  ],
  stage2: [
    { text_content: 'غَفُور لُطْف نُور', translation: 'Most Forgiving - gentleness - light' },
    { text_content: 'قُرْآن ظُلْم وَحْدَه', translation: 'the recitation - wrongdoing - Him alone' },
  ],
  stage3: [
    { text_content: 'هُدَى نُور دِين', translation: 'guidance - light - religion' },
    { text_content: 'بِسْمِ تَبَارَكَ حَمْد رَحْمَٰن', translation: 'in the name of - blessed is He - praise - Most Merciful' },
  ],
  stage4: [
    { text_content: 'سَلَامٌ ثَبَات صِرَاط', translation: 'peace - steadfastness - the path' },
    { text_content: 'إِنَّا قَدْ زَكَاة قُرْآن', translation: 'indeed We - certainly - purifying charity - the recitation' },
  ],
  stage5: [
    { text_content: 'أَب أُمّ اِبْن أَخ', translation: 'father - mother - son - brother' },
    { text_content: 'قَالَ جَاءَ نُور', translation: 'he said - he came - light' },
  ],
  stage6: [
    { text_content: 'أَصْفَر أَبْيَض أَخْضَر أَسْوَد', translation: 'yellow - white - green - black' },
    { text_content: 'وَاحِد سِتَّة سَبْع عَشْر دَائِرَة هِلَال', translation: 'one - six - seven - ten - circle - crescent moon' },
  ],
  stage7: [
    { text_content: 'اللّٰه رَبّ نَبِيّ رَسُول', translation: 'Allah - Lord - Prophet - Messenger' },
    { text_content: 'صَلَاة إِيمَان إِسْلَام أُمَّة', translation: 'prayer - faith - submission (Islam) - community' },
  ],
  stage8: [
    { text_content: 'بِسْمِ اللَّهِ الْحَمْدُ لِلَّه', translation: 'in the name of Allah - all praise is due to Allah' },
    { text_content: 'سُبْحَانَ اللَّه إِنْ شَاءَ اللَّه مَا شَاءَ اللَّه', translation: 'glory be to Allah - if Allah wills - what Allah has willed' },
  ],
  stage9: [
    { text_content: 'بَيْتُ اللَّه رَبُّ الْعَالَمِينَ', translation: 'the House of Allah - the Lord of the worlds' },
    { text_content: 'مُسْلِمَة مُسْلِمَات مُسْلِمُونَ', translation: 'a Muslim woman - Muslim women - Muslims (men)' },
  ],
  stage10: [
    { text_content: 'هَٰذَا الْكِتَابُ', translation: 'This is the Book.' },
    { text_content: 'رَبِّي رَبُّهُ', translation: 'my Lord - his Lord' },
  ],
  stage11: [
    { text_content: 'فَوْقَ تَحْتَهَا الْأَنْهَار', translation: 'above - beneath which rivers flow' },
    { text_content: 'أَمَام خَلْف', translation: 'in front of - behind' },
  ],
  stage12: [
    { text_content: 'مَتَى كَيْفَ أَيْنَ مَا', translation: 'when - how - wherever' },
    { text_content: 'مَالِكِ يَوْمِ الدِّين', translation: 'Master of the Day of Judgement.' },
  ],
  stage13: [
    { text_content: 'هُوَ كَتَبَ', translation: 'He wrote.' },
    { text_content: 'هُوَ ذَهَبَ. هُوَ قَرَأَ', translation: 'He went. He read.' },
  ],
  stage14: [
    { text_content: 'هُوَ يَعْلَمُ. هُوَ يَرْزُقُ', translation: 'He knows. He provides.' },
    { text_content: 'نَحْنُ نَعْبُدُ. نَحْنُ نَسْتَعِينُ', translation: 'We worship. We ask for help.' },
  ],
  stage15: [
    { text_content: 'إِن تَعُدُّوا', translation: 'If you count...' },
    { text_content: 'لَوْ كَانَ', translation: 'If there were...' },
  ],
  stage16: [
    { text_content: 'مَكْتَبَة عَالِم', translation: 'library - scholar' },
    { text_content: 'رَبِّ زِدْنِي عِلْمًا', translation: 'My Lord, increase me in knowledge.' },
  ],
};
