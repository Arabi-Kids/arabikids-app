// Single place to rename characters or retune their look (spec section 1).
// Names are placeholders - change `name` here and every screen follows.
// Mirrors the `characters` table seeded by supabase/add_interactive_upgrade.sql.
export const BRAND = {
  primary: '#1B4F8A',
  gold: '#E7A73E',
};

// Arabic spellings of the characters' names, used in the Arabic interface.
const NAMES_AR = { hudi: 'هُدْهُد', amir: 'أَمِير', nur: 'نُور' };

/** A character's display name in the child's language. */
export function characterName(id, language) {
  return language === 'ar' ? NAMES_AR[id] ?? id : CHARACTERS[id]?.name ?? id;
}

export const CHARACTERS = {
  hudi: {
    id: 'hudi',
    name: 'Hudi',
    role: 'Arabic Curriculum guide',
    kind: 'hoopoe',
    label: 'Hudi the hoopoe',
  },
  amir: {
    id: 'amir',
    name: 'Amir',
    role: 'Practical Life demonstrator (boy profile)',
    kind: 'boy',
    label: 'Amir',
  },
  nur: {
    id: 'nur',
    name: 'Nur',
    role: 'Practical Life demonstrator (girl profile)',
    kind: 'girl',
    label: 'Nur',
  },
};

export const CHARACTER_STATES = ['idle', 'wave', 'talk', 'point', 'cheer', 'think', 'sleepy'];

/** The demonstrator matches the child profile (boy -> Amir, girl -> Nur);
 * the other appears as a friend/cheerer. Hudi hosts all Arabic lessons. */
export function demonstratorIds(child) {
  const pick = child?.demonstrator === 'nur' ? 'nur' : 'amir';
  return { demonstrator: pick, friend: pick === 'amir' ? 'nur' : 'amir' };
}
