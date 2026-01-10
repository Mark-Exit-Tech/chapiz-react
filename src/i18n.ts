import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enMessages from './utils/messages/en.json';
import heMessages from './utils/messages/he.json';

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
