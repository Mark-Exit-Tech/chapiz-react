import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import heTranslations from './locales/he.json';

// Define supported languages
export const supportedLanguages = ['en', 'he'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Language configuration
export const languageConfig = {
    en: {
        name: 'English',
        dir: 'ltr' as const,
    },
    he: {
        name: 'עברית',
        dir: 'rtl' as const,
    },
};

// Initialize i18next
i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources: {
            en: { translation: enTranslations },
            he: { translation: heTranslations },
        },
        fallbackLng: 'en',
        supportedLngs: supportedLanguages,

        // Language detection options
        detection: {
            // Order of detection methods
            order: ['path', 'localStorage', 'navigator'],
            // Keys to look for in localStorage
            lookupLocalStorage: 'i18nextLng',
            // Cache user language
            caches: ['localStorage'],
            // Don't cache on server side
            excludeCacheFor: ['cimode'],
        },

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // React specific options
        react: {
            useSuspense: false, // Disable suspense for now
        },
    });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
    const direction = languageConfig[lng as SupportedLanguage]?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = lng;
});

export default i18n;
