import NumberUtils from './NumberUtils';

describe('NumberUtils', () => {
  describe('format()', () => {
    [
      { num: 0, digits: 1, expected: '0' },
      { num: 12, digits: 1, expected: '12' },
      { num: 1234, digits: 1, expected: '1.2k' },
      { num: 100000000, digits: 1, expected: '100M' },
      { num: 299792458, digits: 1, expected: '299.8M' },
      { num: 759878, digits: 1, expected: '759.9k' },
      { num: 759878, digits: 0, expected: '760k' },
      { num: 123, digits: 1, expected: '123' },
      { num: 123.456, digits: 1, expected: '123.5' },
      { num: 123.456, digits: 2, expected: '123.46' },
      { num: 123.456, digits: 4, expected: '123.456' },
      { num: -1000, digits: 0, expected: '-1k' },
    ].forEach(item => {
      test('it formats a number to nearest mnemonic multiplier', () => {
        const result = NumberUtils.format(item.num, item.digits);
        expect(result).toEqual(item.expected);
      });
    });
  });
});
