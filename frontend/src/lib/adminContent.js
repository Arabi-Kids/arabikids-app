import { supabaseAdmin } from './supabaseAdmin.js';
import { isFixtureMode } from './content.js';

// Admin-portal side of the content store / audio manifest. Enforcement is by
// RLS (is_admin()) on this session's user, not by anything client-side.

async function currentAdminId() {
  const { data } = await supabaseAdmin.auth.getUser();
  return data?.user?.id ?? null;
}

export async function listContentForReview({ kind = 'all', status = 'all' } = {}) {
  if (isFixtureMode) {
    const mod = await Object.values(import.meta.glob('../dev/contentFixture.json'))[0]();
    return mod.default.items.filter((r) => (kind === 'all' || r.kind === kind) && (status === 'all' || r.review_status === status));
  }
  let query = supabaseAdmin
    .from('content_items')
    .select('id, kind, stage_no, order_index, is_free, label, data, review_status, review_note, reviewed_at')
    .order('kind')
    .order('order_index');
  if (kind !== 'all') query = query.eq('kind', kind);
  if (status !== 'all') query = query.eq('review_status', status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function setContentReview(ids, { status, note }) {
  const reviewedBy = await currentAdminId();
  const patch = { review_status: status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() };
  if (note !== undefined) patch.review_note = note;
  const { error } = await supabaseAdmin.from('content_items').update(patch).in('id', ids);
  if (error) throw new Error(error.message);
}

export async function listAudioAssets({ status = 'all', language = 'all', search = '' } = {}) {
  if (isFixtureMode) {
    const mod = await Object.values(import.meta.glob('../dev/contentFixture.json'))[0]();
    return mod.default.audio
      .filter((c) => (status === 'all' || c.status === status) && (language === 'all' || c.language === language) && (!search || c.id.toLowerCase().includes(search.toLowerCase())))
      .slice(0, 60);
  }
  let query = supabaseAdmin
    .from('audio_assets')
    .select('*')
    .order('id')
    .limit(1000);
  if (status !== 'all') query = query.eq('status', status);
  if (language !== 'all') query = query.eq('language', language);
  if (search.trim()) query = query.ilike('id', `%${search.trim()}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAudioAsset(id, patch) {
  const next = { ...patch };
  if (patch.status && patch.status !== 'pending') {
    next.reviewed_by = await currentAdminId();
    next.reviewed_at = new Date().toISOString();
  }
  const { error } = await supabaseAdmin.from('audio_assets').update(next).eq('id', id);
  if (error) throw new Error(error.message);
}
