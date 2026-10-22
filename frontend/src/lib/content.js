import { supabase } from './supabase.js';

// DEV-ONLY preview: with VITE_CONTENT_FIXTURE=1 under `vite` (never in a
// production build - the branch is dead-code-eliminated), content reads come
// from a JSON generated from the reviewed pack instead of Supabase, so the
// new screens can be previewed before the migration/import has run.
export const isFixtureMode = import.meta.env.DEV && import.meta.env.VITE_CONTENT_FIXTURE === '1';
let fixtureRows = null;
async function fixture() {
  if (!fixtureRows) {
    const mod = await Object.values(import.meta.glob('../dev/contentFixture.json'))[0]();
    fixtureRows = mod.default.items.map((r) => ({ ...r, review_status: 'approved' }));
  }
  return fixtureRows;
}

// Kid-facing reads for the reviewed content store (content_items), per-child
// progress, stickers and intro-seen. RLS does the real gating: a child only
// ever receives APPROVED items (free ones, or any if entitled); an admin
// signed in on the public site also receives drafts, which is how preview
// works - callers flag those via `reviewStatus`.

function mapItem(row) {
  return {
    id: row.id,
    kind: row.kind,
    stageNo: row.stage_no,
    orderIndex: row.order_index,
    isFree: row.is_free,
    label: row.label,
    sublabel: row.sublabel,
    data: row.data,
    reviewStatus: row.review_status,
    reviewNote: row.review_note,
  };
}

/** Approved-item index with no `data` (locked cards for paywalled content). */
export async function listContentIndex(kind = null) {
  if (isFixtureMode) {
    return (await fixture())
      .filter((r) => !kind || r.kind === kind)
      .map((r) => ({ id: r.id, kind: r.kind, stageNo: r.stage_no, orderIndex: r.order_index, isFree: r.is_free, label: r.label, sublabel: r.sublabel }));
  }
  const { data, error } = await supabase.rpc('list_content_index', { p_kind: kind });
  if (error) throw new Error(error.message);
  return data.map((r) => ({
    id: r.id,
    kind: r.kind,
    stageNo: r.stage_no,
    orderIndex: r.order_index,
    isFree: r.is_free,
    label: r.label,
    sublabel: r.sublabel,
  }));
}

export async function getContentItems({ kind, stageNo, ids } = {}) {
  if (isFixtureMode) {
    return (await fixture())
      .filter((r) => (!kind || r.kind === kind) && (stageNo == null || r.stage_no === stageNo) && (!ids || ids.includes(r.id)))
      .sort((a, b) => a.order_index - b.order_index)
      .map(mapItem);
  }
  let query = supabase.from('content_items').select('*').order('order_index');
  if (kind) query = query.eq('kind', kind);
  if (stageNo != null) query = query.eq('stage_no', stageNo);
  if (ids) query = query.in('id', ids);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data.map(mapItem);
}

export async function getContentItem(id) {
  if (isFixtureMode) {
    const row = (await fixture()).find((r) => r.id === id);
    return row ? mapItem(row) : null;
  }
  const { data, error } = await supabase.from('content_items').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapItem(data) : null;
}

/** Letter row + its positions row (L07 + P07) in one round trip. */
export async function getLetterBundle(letterId) {
  const n = letterId.replace(/^L/, '');
  const items = await getContentItems({ ids: [`L${n}`, `P${n}`] });
  return {
    letter: items.find((i) => i.kind === 'letter') ?? null,
    positions: items.find((i) => i.kind === 'position') ?? null,
  };
}

// ---------------------------------------------------------------------------
// Progress / stickers / intros
// ---------------------------------------------------------------------------

export async function listCompletedContentIds(childId) {
  const { data, error } = await supabase
    .from('child_content_progress')
    .select('item_id, completed_at')
    .eq('child_id', childId)
    .not('completed_at', 'is', null);
  if (error) throw new Error(error.message);
  return data.map((r) => r.item_id);
}

export async function completeContentItem({ childId, itemId, score = 100 }) {
  const nowIso = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('child_content_progress')
    .select('attempts, completed_at')
    .eq('child_id', childId)
    .eq('item_id', itemId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error } = await supabase.from('child_content_progress').upsert(
    {
      child_id: childId,
      item_id: itemId,
      score,
      completed_at: existing?.completed_at ?? nowIso,
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempt_at: nowIso,
    },
    { onConflict: 'child_id,item_id' }
  );
  if (error) throw new Error(error.message);
}

export async function listStickers(childId) {
  const { data, error } = await supabase
    .from('sticker_book')
    .select('sticker_id, earned_at')
    .eq('child_id', childId)
    .order('earned_at');
  if (error) throw new Error(error.message);
  return data.map((r) => ({ stickerId: r.sticker_id, earnedAt: r.earned_at }));
}

/** Idempotent. Resolves true only the first time this sticker is earned. */
export async function awardSticker(childId, stickerId) {
  const { data, error } = await supabase
    .from('sticker_book')
    .upsert({ child_id: childId, sticker_id: stickerId }, { onConflict: 'child_id,sticker_id', ignoreDuplicates: true })
    .select('id');
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function listSeenIntroIds(childId) {
  const { data, error } = await supabase.from('intro_seen').select('intro_id').eq('child_id', childId);
  if (error) throw new Error(error.message);
  return data.map((r) => r.intro_id);
}

export async function markIntroSeen(childId, introId) {
  const { error } = await supabase
    .from('intro_seen')
    .upsert({ child_id: childId, intro_id: introId }, { onConflict: 'child_id,intro_id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Audio manifest
// ---------------------------------------------------------------------------

/** id -> { fileUrl, timings, status }. Non-admins only ever receive approved
 * rows (RLS); an admin also receives pending ones, flagged by `status` so the
 * player can badge them as preview-only. */
export async function getAudioManifest() {
  if (isFixtureMode) {
    // Locally generated clips (see vite.config.js devAudioLibrary), shown as pending/preview.
    const map = new Map();
    try {
      const ids = await (await fetch('/dev-audio/index.json')).json();
      for (const id of ids) map.set(id, { fileUrl: `/dev-audio/${id}.mp3`, timings: null, status: 'pending' });
    } catch {
      // no local library yet - clips just show "audio coming soon"
    }
    return map;
  }
  // The API returns at most 1000 rows per request, and there are more clips than
  // that, so read the table in stable pages until a short page comes back.
  const PAGE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('audio_assets')
      .select('id, file_url, timings_json, status')
      .not('file_url', 'is', null)
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  const map = new Map();
  for (const r of rows) {
    if (r.status === 'rejected') continue;
    map.set(r.id, { fileUrl: r.file_url, timings: r.timings_json, status: r.status });
  }
  return map;
}

/** One round trip for a whole stage (up to a few dozen items). */
export async function completeContentItems({ childId, itemIds }) {
  if (!itemIds.length) return;
  const nowIso = new Date().toISOString();
  const rows = itemIds.map((itemId) => ({
    child_id: childId,
    item_id: itemId,
    score: 100,
    completed_at: nowIso,
    attempts: 1,
    last_attempt_at: nowIso,
  }));
  const { error } = await supabase.from('child_content_progress').upsert(rows, { onConflict: 'child_id,item_id' });
  if (error) throw new Error(error.message);
}

export async function awardStickers(childId, stickerIds) {
  if (!stickerIds.length) return;
  const rows = stickerIds.map((stickerId) => ({ child_id: childId, sticker_id: stickerId }));
  const { error } = await supabase
    .from('sticker_book')
    .upsert(rows, { onConflict: 'child_id,sticker_id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}
