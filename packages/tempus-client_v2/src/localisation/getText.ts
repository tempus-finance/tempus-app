import Words from './words';
import en from './en';
import es from './es';
import it from './it';
import zz from './zz';

// zz: pseudo translation
export type Language = 'en' | 'es' | 'it' | 'zz';

const getText = (
  word: Words,
  language?: Language,
  replacement: { [key in string]?: string | number | null } = {},
): string => {
  let string: string;
  switch (language) {
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
