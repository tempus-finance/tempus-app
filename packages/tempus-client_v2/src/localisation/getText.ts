import Words from './words';
import en from './en';
import es from './es';
import it from './it';

export type Language = 'en' | 'es' | 'it';

const getText = (word: Words, language?: Language): string => {
  switch (language) {
    case 'es':
      return es[word];
    case 'it':
      return it[word];
    default:
      return en[word];
  }
};

export default getText;
