// Static config for the Lessons Hub's pillar tiles (spec section 11). Only
// 'arabic-quran' has real content today; the rest render a "Coming Soon"
// preview instead of a dead link, per the build directive.
export const PILLARS = [
  {
    key: 'arabic-quran',
    name: 'Arabic & Qur’an Curriculum',
    tagline: '16 stages, one continuous journey from first letters to fluent reading.',
    icon: '📖',
    status: 'live',
    path: '/lessons/curriculum',
  },
  {
    key: 'practical-life',
    name: 'Islamic Practical Life',
    tagline: 'Wudu, Salah and everyday du’as, step by step.',
    icon: '🕌',
    status: 'coming-soon',
    items: [
      'Wudu (ablution) — the step-by-step cleansing process',
      'Salah (prayer) — movements and Arabic recitation with proper pronunciation',
      'Du’as for daily life — before/after eating, entering/leaving the house, and more',
    ],
  },
  {
    key: 'character-stories',
    name: 'Character & Stories',
    tagline: 'The Prophet’s life and the stories of the Prophets, made for kids.',
    icon: '📚',
    status: 'coming-soon',
    items: [
      'Seerah for kids — age-appropriate stories from the Prophet’s life, tied to manners and character',
      'Stories of the Prophets — narrative learning that reinforces Arabic vocabulary and values',
    ],
  },
  {
    key: 'knowledge-extras',
    name: 'Qur’an & Knowledge Extras',
    tagline: 'Memorization tracking, the Islamic calendar, and the 99 Names.',
    icon: '✨',
    status: 'coming-soon',
    items: [
      'Qur’an memorization (Hifz) tracker — short surahs with progress tracking',
      'Islamic calendar awareness — Ramadan, Eid, Hijri months and seasonal content',
      'Asma-ul-Husna (99 Names) — a standalone mini-track',
    ],
  },
];

export function getPillar(key) {
  return PILLARS.find((p) => p.key === key);
}
