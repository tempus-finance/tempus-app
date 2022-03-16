import { Locale as dateFnsLocale } from 'date-fns';

export type LocaleCode = 'en' | 'es' | 'it' | 'zz';

export interface Locale {
  code: LocaleCode;
  dateLocale: dateFnsLocale;
}
