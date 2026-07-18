import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { mapUserRow } from '../lib/db.js';

// Deliberately separate from the public AuthContext: a distinct Supabase
// client with its own localStorage session key (lib/supabaseAdmin.js), so
// the admin portal is a fully independent session even though it's the same
// underlying Supabase Auth user table (admin = a users row with role='admin').
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setAdmin(null);
      return;
    }
    const { data } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    const mapped = mapUserRow(data);
    setAdmin(mapped?.role === 'admin' ? mapped : null);
  }, []);

  useEffect(() => {
    let active = true;

    supabaseAdmin.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      await loadProfile(session?.user?.id);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profileRow } = await supabaseAdmin.from('users').select('*').eq('id', data.user.id).maybeSingle();
    const mapped = mapUserRow(profileRow);
    if (mapped?.role !== 'admin') {
      await supabaseAdmin.auth.signOut();
      throw new Error('This account does not have admin access.');
    }
    setAdmin(mapped);
    return mapped;
  }, []);

  const logout = useCallback(async () => {
    await supabaseAdmin.auth.signOut();
    setAdmin(null);
  }, []);

  const value = { admin, loading, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
