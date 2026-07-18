import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy frontend/.env.example to frontend/.env and fill in your Supabase project values.');
}

// Public site client. Uses its own localStorage key so a logged-in admin
// session (frontend/src/lib/supabaseAdmin.js) never collides with a
// logged-in parent/customer session, even though both apps share one origin.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'arabikids-public-auth' },
});
