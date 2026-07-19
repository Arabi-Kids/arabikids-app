import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { mapUserRow } from '../lib/db.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setUser(null);
      return;
    }
    const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    setUser(mapUserRow(data));
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!active) return;
      setSession(initialSession);
      await loadProfile(initialSession?.user?.id);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      await loadProfile(data.user.id);
      const { data: profileRow } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();
      return mapUserRow(profileRow);
    },
    [loadProfile]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Sign up failed — please try again.');

      // If the Supabase project has "Confirm email" enabled, signUp succeeds
      // but returns no session until the user clicks the confirmation link —
      // don't pretend they're logged in (onAuthStateChange will also fire
      // with a null session here and would otherwise race with this).
      if (!data.session) {
        return { needsEmailConfirmation: true, user: null };
      }

      // public.users is populated by an on-signup DB trigger, which can lag
      // a beat behind the client seeing the new auth user — retry briefly.
      let profileRow = null;
      for (let attempt = 0; attempt < 5 && !profileRow; attempt += 1) {
        const { data: row } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();
        profileRow = row;
        if (!profileRow) await new Promise((r) => setTimeout(r, 400));
      }
      setUser(mapUserRow(profileRow));
      return { needsEmailConfirmation: false, user: mapUserRow(profileRow) };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }, []);

  const isPaid = useCallback(() => user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'past_due', [user]);
  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  const value = {
    session,
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    isPaid,
    isAdmin,
    refreshProfile: () => loadProfile(session?.user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
