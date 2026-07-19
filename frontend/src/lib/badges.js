// Static badge catalog — presentational only (name/description), no
// admin-editability requirement, so this stays a frontend constant instead
// of a database table. Earned badges are persisted in child_badges by code.
export const BADGE_CATALOG = [
  { code: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson.' },
  { code: 'lessons_10', name: 'Getting Started', description: 'Complete 10 lessons.' },
  { code: 'lessons_50', name: 'Halfway Hero', description: 'Complete 50 lessons.' },
  { code: 'lessons_100', name: 'Century Club', description: 'Complete 100 lessons.' },
  { code: 'streak_3', name: 'On a Roll', description: 'Reach a 3-day learning streak.' },
  { code: 'streak_7', name: 'Week Strong', description: 'Reach a 7-day learning streak.' },
  { code: 'streak_30', name: 'Habit Formed', description: 'Reach a 30-day learning streak.' },
  { code: 'level_beginner', name: 'Beginner Graduate', description: 'Master every stage in the Beginner level.' },
  { code: 'level_elementary', name: 'Elementary Graduate', description: 'Master every stage in the Elementary level.' },
  { code: 'level_intermediate', name: 'Intermediate Graduate', description: 'Master every stage in the Intermediate level.' },
  { code: 'level_advanced', name: 'ArabiKids Graduate', description: 'Master all 16 stages — the full curriculum!' },
];

export const LESSON_COUNT_BADGES = [
  { code: 'first_lesson', threshold: 1 },
  { code: 'lessons_10', threshold: 10 },
  { code: 'lessons_50', threshold: 50 },
  { code: 'lessons_100', threshold: 100 },
];

export const STREAK_BADGES = [
  { code: 'streak_3', threshold: 3 },
  { code: 'streak_7', threshold: 7 },
  { code: 'streak_30', threshold: 30 },
];

// Level order_index (1-4) -> the badge earned for mastering every stage in it.
export const LEVEL_BADGE_BY_ORDER = {
  1: 'level_beginner',
  2: 'level_elementary',
  3: 'level_intermediate',
  4: 'level_advanced',
};

export function badgeInfo(code) {
  return BADGE_CATALOG.find((b) => b.code === code) ?? { code, name: code, description: '' };
}
