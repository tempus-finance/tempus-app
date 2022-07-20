import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LngDetector from 'i18next-browser-languagedetector';
import TimeAgo from 'javascript-time-ago';
import TimeAgoLocaleEN from 'javascript-time-ago/locale/en';
import resources from './translations';
import { SUPPORTED_LOCALES, SupportedLocale } from './i18nTypes';

i18n
  .use(initReactI18next)
  .use(LngDetector)
  .init({
    resources,
    fallbackLng: SUPPORTED_LOCALES[0],
    supportedLngs: SUPPORTED_LOCALES,
    load: 'currentOnly',
    returnEmptyString: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      lookupCookie: 'tempus-app-locale',
      lookupLocalStorage: 'tempus-app-locale',
      caches: ['localStorage', 'cookie'],
      cookieMinutes: 7 * 24 * 60,
    },

    react: {
      useSuspense: false,
    },
  });

TimeAgo.setDefaultLocale('en');
TimeAgo.addLocale(TimeAgoLocaleEN);

export type { SupportedLocale };
export { SUPPORTED_LOCALES };
export default i18n;
