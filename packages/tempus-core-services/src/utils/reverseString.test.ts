import { reverseString } from './reverseString';

describe('reverseString()', () => {
  test('return a reversed string for 10 random strings', () => {
    for (let i = 0; i < 10; i++) {
      const randomString = Math.random().toString(36);
      const reversed = randomString
        .split('')
        .sort(() => -1)
        .join('');

      expect(reverseString(randomString)).toEqual(reversed);
    }
  });
});
