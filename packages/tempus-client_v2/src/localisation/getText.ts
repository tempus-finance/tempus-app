import Words from './words';
import en from './en.json';
import it from './it.json';

export type Language = 'en' | 'it';

const getText = (word: Words, language?: Language): string => {
  switch (language) {
    case 'it':
      return it[word];
    default:
      return en[word];
  }
};

export default getText;
