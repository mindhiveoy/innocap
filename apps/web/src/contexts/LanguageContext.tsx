'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as CookieConsent from 'vanilla-cookieconsent';
import { LanguageContext, useLanguage, type Language } from '@repo/shared';

export { useLanguage };
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