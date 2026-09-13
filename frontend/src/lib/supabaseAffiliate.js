import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Same Supabase project as lib/supabase.js and lib/supabaseAdmin.js, but a
// third distinct auth storage key so the affiliate portal keeps its own
// independent session — logging into /affiliate/login never signs you into
// the public site or admin portal (or vice versa), even though all three are
// route trees in the same single-page app on the same origin. Row-level
// access for affiliate data is enforced server-side by RLS policies keyed on
// this session's user (see supabase/add_affiliate_program.sql), not by
// anything client-side.
export const supabaseAffiliate = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'arabikids-affiliate-auth' },
});
