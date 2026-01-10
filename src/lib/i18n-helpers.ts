import { useTranslation as useI18nTranslation } from 'react-i18next';

// Wrapper to match next-intl API
export function useTranslation(namespace?: string) {
    const { t } = useI18nTranslation();

    // Return a function that handles nested keys like next-intl
    return (key: string) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        return t(fullKey);
    };
}

export function useLocale() {
    const { i18n } = useI18nTranslation();
    return i18n.language;
}

export function usePathname() {
    return window.location.pathname;
}
