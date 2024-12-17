'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as CookieConsent from 'vanilla-cookieconsent';

type Language = 'en' | 'fi';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    (i18n.language?.split('-')[0] as Language) || 'en'
  );

  const changeLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    // Also update cookie consent language
    CookieConsent.setLanguage(lang);
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 