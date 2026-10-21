// DEV preview only: turns the content pack into frontend/src/dev/contentFixture.json
// so the new screens can be previewed with VITE_CONTENT_FIXTURE=1 before the DB
// migration/import has run. Never read by a production build.
//   node scripts/generate-dev-fixture.mjs <path-to-pack.md>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseContentPack, buildAudioManifest } from './import-content-pack.mjs';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('Usage: node scripts/generate-dev-fixture.mjs <path-to-pack.md>');
  process.exit(1);
}
const items = parseContentPack(files.map((f) => readFileSync(f, 'utf8')).join('\n\n'));
const audio = buildAudioManifest(items);
mkdirSync('frontend/src/dev', { recursive: true });
writeFileSync('frontend/src/dev/contentFixture.json', JSON.stringify({ items, audio }, null, 1));
console.log(`fixture: ${items.length} items, ${audio.length} clips`);
