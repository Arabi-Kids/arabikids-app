// Static config for the Lessons Hub's pillar tiles (spec section 11). Only
// 'arabic-quran' has real content today; the rest render a "Coming Soon"
// preview instead of a dead link, per the build directive.
export const PILLARS = [
  {
    key: 'arabic-quran',
    name: 'Arabic Curriculum',
    tagline: '16 stages, one continuous journey from first letters to fluent reading.',
    icon: '📖',
    status: 'live',
    path: '/lessons/curriculum',
    accent: 'var(--color-blue)',
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
    accent: 'var(--color-teal)',
  },
  {
    key: 'character-stories',
    name: 'Character & Stories',
    tagline: 'The Prophet’s life and the stories of the Prophets, made for kids.',
    icon: '📿',
    status: 'coming-soon',
    items: [
      'Seerah for kids — age-appropriate stories from the Prophet’s life, tied to manners and character',
      'Stories of the Prophets — narrative learning that reinforces Arabic vocabulary and values',
    ],
    accent: 'var(--color-purple)',
  },
  {
    key: 'knowledge-extras',
    name: 'Qur’an & Knowledge Extras',
    tagline: 'Progressive Surah recitation, word-by-word Qur’anic connections, and fluency checks.',
    icon: '🌙',
    status: 'live',
    path: '/lessons/quran',
    accent: 'var(--color-orange)',
  },
];

export function getPillar(key) {
  return PILLARS.find((p) => p.key === key);
}
