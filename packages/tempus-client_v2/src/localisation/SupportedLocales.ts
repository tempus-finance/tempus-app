import { Locale, LocaleCode } from '../interfaces/Locale';
import dateLocaleEN from 'date-fns/locale/en-US';
import dateLocaleIT from 'date-fns/locale/it';
import dateLocaleES from 'date-fns/locale/es';

export const EN: Locale = {
  code: 'en',
  dateLocale: dateLocaleEN,
};

export const IT: Locale = {
  code: 'it',
  dateLocale: dateLocaleIT,
};

export const ES: Locale = {
  code: 'es',
  dateLocale: dateLocaleES,
};

// zz: pseudo translation
export const ZZ: Locale = {
  code: 'zz',
  dateLocale: dateLocaleEN,
};

const ALL_LOCALES: { [key in string]: Locale } = {
  EN,
  IT,
  ES,
  ZZ,
};

export default ALL_LOCALES;

export const getLocaleFromCode = (code: LocaleCode): Locale => ALL_LOCALES[code.toUpperCase()] || EN;
