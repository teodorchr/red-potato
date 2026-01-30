import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ro from './locales/ro.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  ro: { translation: ro },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ro',
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const languages = [
  { code: 'ro', name: 'Romana', flag: '🇷🇴' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Francais', flag: '🇫🇷' },
];

export default i18n;
