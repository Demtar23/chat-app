import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { uk } from './locales/uk';
import { en } from './locales/en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { uk, en },
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;