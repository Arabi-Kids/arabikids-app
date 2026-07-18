import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Same Supabase project as lib/supabase.js, but a distinct auth storage key
// so the admin portal keeps its own independent session — logging into
// /admin/login never signs you into the public site (or vice versa), even
// though both are routes in the same single-page app on the same origin.
// Row-level access for admin actions is enforced server-side by RLS
// policies (`is_admin()`) keyed on this session's user, not by anything
// client-side.
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'arabikids-admin-auth' },
});
