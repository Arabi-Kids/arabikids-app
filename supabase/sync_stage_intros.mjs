// Standalone, additive-only update for the LIVE project - writes each
// stage's intro_kids/intro_parents columns from seed.mjs's STAGES array,
// matched to existing DB rows by order_index. Requires
// supabase/add_stage_intros.sql to have been run first (adds the columns).
// Purely additive - never touches lessons, checkpoints, or progress.
//
// Usage: node supabase/sync_stage_intros.mjs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { STAGES } from './seed.mjs';

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

  let updated = 0;
  let skipped = 0;

  for (const stage of STAGES) {
    const stageId = stageIdByOrder.get(stage.order_index);
    if (!stageId) {
      console.warn(`No DB stage found for order_index ${stage.order_index} (${stage.name}) - skipping.`);
      skipped++;
      continue;
    }
    const { error: updateError } = await supabase
      .from('stages')
      .update({ intro_kids: stage.intro_kids, intro_parents: stage.intro_parents })
      .eq('id', stageId);
    if (updateError) throw new Error(updateError.message);
    updated++;
  }

  console.log(`Synced ${updated} stage intros. Skipped ${skipped}.`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
