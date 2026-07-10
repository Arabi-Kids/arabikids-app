import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('arabikids_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api
      .get('/auth/me', token)
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('arabikids_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: loggedInUser } = await api.post('/auth/login', { email, password });
    localStorage.setItem('arabikids_token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { token: newToken, user: newUser } = await api.post('/auth/register', payload);
    localStorage.setItem('arabikids_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('arabikids_token');
    setToken(null);
    setUser(null);
  }, []);

  const isPaid = useCallback(() => {
    return user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'past_due';
  }, [user]);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  const value = { token, user, loading, login, register, logout, isPaid, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
