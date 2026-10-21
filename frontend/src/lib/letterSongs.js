// Short sung letter songs (AI-sung with the open-source ACE-Step model, MIT licence),
// files in /audio/songs/L<nn>.<ar|en>.mp3. Only the letters and languages listed here
// get a "Sing along" button. The Arabic interface plays the Arabic version; English
// and Malay play the English version.
export const LETTER_SONGS = {
  1: ['ar', 'en'],
  2: ['ar', 'en'],
  3: ['ar', 'en'],
  4: ['ar', 'en'],
  5: ['ar', 'en'],
  6: ['ar', 'en'],
  7: ['ar', 'en'],
  8: ['ar', 'en'],
  9: ['ar', 'en'],
  10: ['ar', 'en'],
  11: ['ar', 'en'],
  12: ['ar', 'en'],
  13: ['ar', 'en'],
  14: ['ar', 'en'],
  15: ['ar', 'en'],
  16: ['ar', 'en'],
  17: ['ar', 'en'],
  18: ['ar', 'en'],
  19: ['ar', 'en'],
  20: ['ar', 'en'],
  21: ['ar', 'en'],
  22: ['ar', 'en'],
  23: ['ar', 'en'],
  24: ['ar', 'en'],
  25: ['ar', 'en'],
  26: ['ar', 'en'],
  27: ['ar', 'en'],
  28: ['ar', 'en'],
};

export function letterSongUrl(letterNo, language) {
  const lang = language === 'ar' ? 'ar' : 'en';
  if (!(LETTER_SONGS[letterNo] || []).includes(lang)) return null;
  return `/audio/songs/L${String(letterNo).padStart(2, '0')}.${lang}.mp3`;
}
