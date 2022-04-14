import { capitalize } from './capitalizeString';

describe('capitalizeString', () => {
  [
    { input: '', expected: '' },
    { input: 'jshfdkhsaf', expected: 'Jshfdkhsaf' },
    { input: 'kjqwvwv', expected: 'Kjqwvwv' },
    { input: '4ijykwef', expected: '4ijykwef' },
    { input: 'oiekvnawv', expected: 'Oiekvnawv' },
    { input: '24hf2asc', expected: '24hf2asc' },
    { input: 'eth5eh', expected: 'Eth5eh' },
    { input: '123e2f', expected: '123e2f' },
    { input: 'j56j', expected: 'J56j' },
    { input: 'afo423', expected: 'Afo423' },
    { input: 'm67mj5m6mn', expected: 'M67mj5m6mn' },
    { input: 'awf2q3f2', expected: 'Awf2q3f2' },
    { input: 'lkp2jd', expected: 'Lkp2jd' },
    { input: 'fk2rbfk2bk', expected: 'Fk2rbfk2bk' },
    { input: 'aj982jfiv', expected: 'Aj982jfiv' },
    { input: 'ajiunu2', expected: 'Ajiunu2' },
    { input: 'aleifj2f', expected: 'Aleifj2f' },
    { input: 'p2o3r2gjn', expected: 'P2o3r2gjn' },
    { input: 'kiv4ihg', expected: 'Kiv4ihg' },
    { input: 'sfslvnwl', expected: 'Sfslvnwl' },
    { input: 'b3i4n2g23', expected: 'B3i4n2g23' },
    { input: 'lwb3ff3', expected: 'Lwb3ff3' },
    { input: 'wiu4iuejvjew', expected: 'Wiu4iuejvjew' },
  ].forEach(({ input, expected }) => {
    test(`capitalize "${input}" should return "${expected}"`, () => {
      expect(capitalize(input)).toEqual(expected);
    });
  });
});
