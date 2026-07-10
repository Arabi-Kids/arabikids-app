import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

// Deliberately separate from the public AuthContext: separate token storage,
// separate session, so the admin portal is a fully independent product.
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('arabikids_admin_token'));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    api
      .get('/auth/me', token)
      .then(({ user }) => {
        if (user.role !== 'admin') throw new Error('Not an admin account.');
        setAdmin(user);
      })
      .catch(() => {
        localStorage.removeItem('arabikids_admin_token');
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user } = await api.post('/auth/login', { email, password });
    if (user.role !== 'admin') {
      throw new Error('This account does not have admin access.');
    }
    localStorage.setItem('arabikids_admin_token', newToken);
    setToken(newToken);
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('arabikids_admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  const value = { token, admin, loading, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
