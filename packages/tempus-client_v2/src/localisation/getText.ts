import Words from './words';
import en from './en.json';
import it from './it.json';
import ru from './ru.json';

export type Language = 'en' | 'it' | 'ru';

const getText = (word: Words, language?: Language): string => {
  switch (language) {
    case 'it':
      return it[word];
    case 'ru':
      return ru[word];
    default:
      return en[word];
  }
};

export default getText;
