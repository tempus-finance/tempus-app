import Words from './words';
import en from './en';
import it from './it';
// import ru from './ru';

// export type Language = 'en' | 'it' | 'ru';
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
