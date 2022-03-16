import { Locale } from '../interfaces/Locale';
import Words from './words';
import en from './en';
import es from './es';
import it from './it';
import zz from './zz';

const getText = (
  word: Words,
  locale?: Locale,
  replacement: { [key in string]?: string | number | null } = {},
): string => {
  let string: string;
  switch (locale?.code) {
    case 'es':
      string = es[word];
      break;
    case 'it':
      string = it[word];
      break;
    case 'zz':
      string = zz[word];
      break;
    default:
      string = en[word];
      break;
  }

  Object.keys(replacement).forEach(key => {
    string = string.replaceAll(`{{${key}}}`, `${replacement[key]}` || '');
  });

  return string;
};

export default getText;
