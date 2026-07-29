// Standalone, additive-only update for the LIVE project - writes each
// stage's reading passages from supabase/reading_passages.mjs into the
// stage_reading_passages table, matched to existing stage rows by
// order_index. Requires supabase/add_review_hub.sql to have been run first
// (creates the table). Purely additive/idempotent - deletes and reinserts
// only that stage's own passage rows, never touches lessons, checkpoints,
// or progress.
//
// Usage: node supabase/sync_reading_passages.mjs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { STAGES } from './seed.mjs';
import { READING_PASSAGES } from './reading_passages.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in the environment (.env).');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  const { data: dbStages, error: stagesError } = await supabase.from('stages').select('id, order_index');
  if (stagesError) throw new Error(stagesError.message);
  const stageIdByOrder = new Map(dbStages.map((s) => [s.order_index, s.id]));

  let inserted = 0;
  let skipped = 0;

  for (const stage of STAGES) {
    const stageId = stageIdByOrder.get(stage.order_index);
    if (!stageId) {
      console.warn(`No DB stage found for order_index ${stage.order_index} (${stage.name}) - skipping.`);
      skipped++;
      continue;
    }
    const passages = READING_PASSAGES[stage.key];
    if (!passages) {
      console.warn(`No reading passages authored for ${stage.key} - skipping.`);
      skipped++;
      continue;
    }

    const { error: delError } = await supabase.from('stage_reading_passages').delete().eq('stage_id', stageId);
    if (delError) throw new Error(`Failed to clear old passages for ${stage.name}: ${delError.message}`);

    const rows = passages.map((p, i) => ({
      stage_id: stageId,
      order_index: i + 1,
      text_content: p.text_content,
      translation: p.translation,
    }));
    const { error: insError } = await supabase.from('stage_reading_passages').insert(rows);
    if (insError) throw new Error(`Failed to insert passages for ${stage.name}: ${insError.message}`);
    inserted += rows.length;
  }

  console.log(`Synced ${inserted} reading passages. Skipped ${skipped} stages.`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
