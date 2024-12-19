import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import fiTranslations from './locales/fi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      fi: {
        translation: fiTranslations,
      },
    },
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 