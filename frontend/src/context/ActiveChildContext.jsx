import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { listChildren } from '../lib/db.js';

const ActiveChildContext = createContext(null);

const STORAGE_KEY = 'arabikids_active_child';

// Tracks which child profile is "active" for the current session — a parent
// with multiple children (Family tier) switches between them here; every
// lesson/progress call downstream is scoped to whichever child is active.
export function ActiveChildProvider({ children }) {
  const { user } = useAuth();
  const [childProfiles, setChildProfiles] = useState([]);
  const [activeChildId, setActiveChildIdState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const refreshChildren = useCallback(async () => {
    if (!user) {
      setChildProfiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listChildren(user.id);
      setChildProfiles(list);
      setActiveChildIdState((current) => {
        if (current && list.some((c) => c.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshChildren();
  }, [refreshChildren]);

  const setActiveChildId = useCallback((id) => {
    setActiveChildIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const activeChild = childProfiles.find((c) => c.id === activeChildId) ?? null;

  const value = {
    childProfiles,
    activeChild,
    activeChildId,
    setActiveChildId,
    loading,
    refreshChildren,
  };

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) throw new Error('useActiveChild must be used within an ActiveChildProvider');
  return ctx;
}
