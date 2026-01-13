import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enMessages from './i18n/locales/en.json';
import heMessages from './i18n/locales/he.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enMessages },
            he: { translation: heMessages }
        },
        lng: 'he', // default language
        fallbackLng: 'he',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
