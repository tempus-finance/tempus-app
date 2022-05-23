import { SupportedLocale } from '../i18nTypes';
import en from './en.json';
import es from './es.json';
import it from './it.json';
import zz from './zz.json';

const NAMESPACE = 'translation';

const translations: Record<SupportedLocale, { [NAMESPACE]: any }> = {
  en: {
    [NAMESPACE]: en,
  },
  es: {
    [NAMESPACE]: es,
  },
  it: {
    [NAMESPACE]: it,
  },
  zz: {
    [NAMESPACE]: zz,
  },
};

export default translations;
