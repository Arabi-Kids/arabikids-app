// Marks content_items as approved so children can see them (row-level security only
// shows approved items). Dry run by default.
//
//   node scripts/approve-content.mjs                      dry run: lists what would change
//   node scripts/approve-content.mjs --apply              approve every draft item except --except ids
//   node scripts/approve-content.mjs --except=WD-B4,WD-B5,L22
//   node scripts/approve-content.mjs --revert --apply     put every item back to draft (rollback)
//
// Run this at release, after the deploy and `publish-audio.mjs --apply`.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const revert = args.includes('--revert');
const except = new Set((args.find((a) => a.startsWith('--except='))?.slice(9) ?? '').split(',').filter(Boolean));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase.from('content_items').select('id,kind,review_status').range(from, from + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}

const target = revert ? 'draft' : 'approved';
const todo = rows.filter((r) => r.review_status !== target && !except.has(r.id));
const byKind = {};
for (const r of todo) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
console.log(`${rows.length} items in the database; ${todo.length} would become ${target}`, byKind);
if (except.size) console.log('left alone:', [...except].join(', '));

if (!apply) {
  console.log('(dry run - nothing changed. Add --apply.)');
} else {
  const ids = todo.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await supabase
      .from('content_items')
      .update({ review_status: target, reviewed_at: revert ? null : new Date().toISOString() })
      .in('id', ids.slice(i, i + 100));
    if (error) throw error;
  }
  console.log(`done: ${ids.length} items are now ${target}`);
}
