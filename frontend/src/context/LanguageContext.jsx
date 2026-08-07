import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { updateUserLanguage } from '../lib/db.js';
import { getTranslation, interpolate } from '../lib/i18n/translations.js';
import LanguagePickerModal from '../components/LanguagePickerModal.jsx';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'ak_language';
const VALID_LANGUAGES = ['en', 'ar', 'ms'];

function applyDocumentDirection(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
}

// Guest choice lives in localStorage; once a parent is logged in, their
// account's saved language (users.language) takes over as the source of
// truth, matching the "saved even after they register" requirement - see
// AuthContext.register()'s best-effort write and mapUserRow's `language`
// field in lib/db.js.
export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_LANGUAGES.includes(stored) ? stored : 'en';
  });
  const [showPicker, setShowPicker] = useState(() => !localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    applyDocumentDirection(language);
  }, [language]);

  // Account language wins over whatever's in localStorage/state once it
  // loads, so logging in on a fresh browser still lands in the right
  // language without needing the first-visit picker again.
  useEffect(() => {
    if (user?.language && VALID_LANGUAGES.includes(user.language) && user.language !== language) {
      setLanguageState(user.language);
      localStorage.setItem(STORAGE_KEY, user.language);
      setShowPicker(false);
    }
  }, [user?.language]);

  const setLanguage = useCallback(
    (next) => {
      if (!VALID_LANGUAGES.includes(next)) return;
      setLanguageState(next);
      localStorage.setItem(STORAGE_KEY, next);
      setShowPicker(false);
      if (user?.id) {
        updateUserLanguage(user.id, next).catch(() => {});
      }
    },
    [user?.id]
  );

  const t = useCallback(
    (path, vars) => {
      const value = getTranslation(language, path);
      return typeof value === 'string' ? interpolate(value, vars) : value;
    },
    [language]
  );

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {showPicker && <LanguagePickerModal onSelect={setLanguage} />}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
