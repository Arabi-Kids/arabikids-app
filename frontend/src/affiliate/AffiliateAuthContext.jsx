import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseAffiliate } from '../lib/supabaseAffiliate.js';

// Deliberately separate from AuthContext/AdminAuthContext: a distinct
// Supabase client with its own localStorage session key
// (lib/supabaseAffiliate.js), even though it's the same underlying
// Supabase Auth user table. Unlike admins, affiliates self-register - see
// register() below.
const AffiliateAuthContext = createContext(null);

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excludes ambiguous 0/O/1/I
function generateReferralCode() {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function mapAffiliateRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    country: row.country,
    payoutMethod: row.payout_method,
    paypalEmail: row.paypal_email,
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    bankAccountHolder: row.bank_account_holder,
    referralCode: row.referral_code,
    status: row.status,
  };
}

export function AffiliateAuthProvider({ children }) {
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setAffiliate(null);
      return;
    }
    const { data } = await supabaseAffiliate.from('affiliates').select('*').eq('auth_user_id', userId).maybeSingle();
    setAffiliate(mapAffiliateRow(data));
  }, []);

  useEffect(() => {
    let active = true;

    supabaseAffiliate.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      await loadProfile(session?.user?.id);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseAffiliate.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabaseAffiliate.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      await loadProfile(data.user.id);
      const { data: profileRow } = await supabaseAffiliate.from('affiliates').select('*').eq('auth_user_id', data.user.id).maybeSingle();
      return mapAffiliateRow(profileRow);
    },
    [loadProfile]
  );

  const register = useCallback(
    async ({ name, email, password, country, payoutMethod, paypalEmail, bankName, bankAccountNumber, bankAccountHolder }) => {
      const { data, error } = await supabaseAffiliate.auth.signUp({
        email,
        password,
        options: { data: { name, signup_context: 'affiliate' } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Sign up failed — please try again.');

      // Same "Confirm email" project setting the public site uses - if it's
      // enabled, there's no session yet until the affiliate clicks the
      // confirmation link, so the affiliates row can't be created until then
      // (RLS requires auth.uid() = auth_user_id, which needs a real session).
      if (!data.session) {
        return { needsEmailConfirmation: true, affiliate: null };
      }

      const payoutFields =
        payoutMethod === 'bank_transfer'
          ? { bank_name: bankName, bank_account_number: bankAccountNumber, bank_account_holder: bankAccountHolder, paypal_email: null }
          : { paypal_email: paypalEmail, bank_name: null, bank_account_number: null, bank_account_holder: null };

      let insertedRow = null;
      let lastError = null;
      for (let attempt = 0; attempt < 5 && !insertedRow; attempt += 1) {
        const referralCode = generateReferralCode();
        const { data: row, error: insertErr } = await supabaseAffiliate
          .from('affiliates')
          .insert({
            auth_user_id: data.user.id,
            name,
            email,
            country,
            payout_method: payoutMethod,
            referral_code: referralCode,
            ...payoutFields,
          })
          .select()
          .single();
        if (row) {
          insertedRow = row;
        } else {
          lastError = insertErr;
          // 23505 = unique_violation - only worth retrying if it's the
          // referral_code that collided, not some other constraint.
          if (insertErr?.code !== '23505') break;
        }
      }
      if (!insertedRow) throw new Error(lastError?.message || 'Could not create your affiliate account — please try again.');

      // Fire-and-forget - a failed admin alert must never block registration.
      fetch('/api/notify-admin-affiliate-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, country, referralCode: insertedRow.referral_code }),
      }).catch(() => {});

      const mapped = mapAffiliateRow(insertedRow);
      setAffiliate(mapped);
      return { needsEmailConfirmation: false, affiliate: mapped };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabaseAffiliate.auth.signOut();
    setAffiliate(null);
  }, []);

  const value = { affiliate, loading, login, register, logout };

  return <AffiliateAuthContext.Provider value={value}>{children}</AffiliateAuthContext.Provider>;
}

export function useAffiliateAuth() {
  const ctx = useContext(AffiliateAuthContext);
  if (!ctx) throw new Error('useAffiliateAuth must be used within an AffiliateAuthProvider');
  return ctx;
}
