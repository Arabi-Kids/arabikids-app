// DEV ONLY - a start page listing every new screen for local testing.
const GROUPS = [
  {
    title: 'Illustrations',
    links: [['Animated letter pictures: contact sheet', '/dev/animals']],
  },
  {
    title: 'Voices',
    links: [['Sound check: 1-2 sentences per stage in Arabic, English and Malay', '/dev/soundcheck']],
  },
  {
    title: 'Arabic Curriculum: Interactive Letters',
    links: [
      ['Letters hub (all 28)', '/lessons/letters'],
      ['Letter 1: Alif', '/dev/letters/1'],
      ['Letter 2: Ba', '/dev/letters/2'],
      ['Letter 3: Ta (with match game)', '/dev/letters/3'],
      ['Letter 5: Jeem (vowels + find the letter)', '/dev/letters/5'],
      ['Letter 22: Kaf (the dog word)', '/dev/letters/22'],
      ['Letter 26: Ha (Hudi himself)', '/dev/letters/26'],
    ],
  },
  {
    title: 'Islamic Practical Life',
    links: [
      ['Practical Life hub', '/lessons/practical'],
      ['Stage 1: Wudu (free)', '/dev/practical/stage/1'],
      ['Stage 2: Prayer basics', '/dev/practical/stage/2'],
      ['Stage 3: Movements', '/dev/practical/stage/3'],
      ['Stage 4: What we say (with surahs)', '/dev/practical/stage/4'],
      ['Stage 5: Full prayer', '/dev/practical/stage/5'],
      ['Stage 6: Duas, home and hygiene', '/dev/practical/stage/6'],
      ['Stage 7: Duas, food (with manners)', '/dev/practical/stage/7'],
      ['Stage 8: Duas, sleep and morning', '/dev/practical/stage/8'],
      ['Stage 9: Duas, going out', '/dev/practical/stage/9'],
      ['Stage 10: Morning & evening adhkar (DRAFT content)', '/dev/practical/stage/10'],
    ],
  },
  {
    title: 'Admin review pages (no login in preview)',
    links: [
      ['Content Review', '/dev-admin/content'],
      ['Audio Review', '/dev-admin/audio'],
    ],
  },
  {
    title: 'Entry point from the existing curriculum page',
    links: [['Arabic Curriculum hub (new Interactive Letters banner)', '/lessons/curriculum']],
  },
];

export default function DevIndex() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <h1 style={{ color: '#1B4F8A', marginBottom: 4 }}>ArabiKids: interactive upgrade preview</h1>
      <p style={{ color: '#4b5a6a', marginTop: 0 }}>
        Local only. Content comes from the content pack on this computer, so every item shows as if approved.
        Nothing here is published and nothing you tap is saved.
      </p>
      {GROUPS.map((g) => (
        <section key={g.title} style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: '1.1rem', color: '#123a66' }}>{g.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {g.links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #1B4F8A', background: '#fff', color: '#1B4F8A', fontWeight: 800, textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
