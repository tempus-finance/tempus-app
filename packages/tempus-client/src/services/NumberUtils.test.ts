import NumberUtils from './NumberUtils';

describe('NumberUtils', () => {
  describe('formatWithMultiplier()', () => {
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
        const result = NumberUtils.formatWithMultiplier(item.num, item.digits);
        expect(result).toEqual(item.expected);
      });
    });
  });

  describe('formatToCurrency()', () => {
    [
      { value: '0', numberOfDecimals: 1, symbol: undefined, expected: '0' },
      { value: '0', numberOfDecimals: 1, symbol: '$', expected: '$0' },
      { value: '0.0', numberOfDecimals: 1, symbol: undefined, expected: '0' },
      { value: '0.0', numberOfDecimals: 1, symbol: '$', expected: '$0' },
      { value: '12', numberOfDecimals: 1, symbol: '$', expected: '$12' },
      { value: '.12123', numberOfDecimals: 4, symbol: '$', expected: '$.1212' },
      { value: '.12123124', numberOfDecimals: 3, symbol: '$', expected: '$.121' },
      { value: '1234', numberOfDecimals: 1, symbol: '$', expected: '$1,234' },
      { value: '100000000', numberOfDecimals: 1, symbol: undefined, expected: '100,000,000' },
      { value: '299792458', numberOfDecimals: 1, symbol: undefined, expected: '299,792,458' },
      { value: '759878', numberOfDecimals: 1, symbol: '$', expected: '$759,878' },
      { value: '759878', numberOfDecimals: 0, symbol: undefined, expected: '759,878' },
      { value: '123', numberOfDecimals: 1, symbol: '$', expected: '$123' },
      { value: '123.456', numberOfDecimals: 1, symbol: '$', expected: '$123.4' },
      { value: '123.456', numberOfDecimals: 2, symbol: undefined, expected: '123.45' },
      { value: '123.456', numberOfDecimals: 0, symbol: undefined, expected: '123' },
      { value: '123123', numberOfDecimals: undefined, symbol: '$', expected: '$123,123' },
      { value: '123', numberOfDecimals: undefined, symbol: undefined, expected: '123' },
      { value: '123.4', numberOfDecimals: undefined, symbol: undefined, expected: '123.4' },
      { value: '123.456', numberOfDecimals: undefined, symbol: '$', expected: '$123.45' },
      { value: '123.456', numberOfDecimals: 4, symbol: '$', expected: '$123.456' },
    ].forEach(item => {
      test(`It formats input string '${item.value}' to '${item.expected}'`, () => {
        const result = NumberUtils.formatToCurrency(item.value, item.numberOfDecimals, item.symbol);
        expect(result).toEqual(item.expected);
      });
    });
  });

  describe('formatPercentage()', () => {
    [
      { num: 0, expected: '0%' },
      { num: 1, expected: '100%' },
      { num: 1, precision: 2, expected: '100%' },
      { num: 0.2, expected: '20%' },
      { num: 0.12345, precision: 2, expected: '12.34%' },
      { num: 0.987659, precision: 3, roundValue: true, expected: '98.766%' },
      { num: 0.987659, precision: 3, roundValue: false, expected: '98.765%' },
      { num: 0.05, expected: '5%' },
      { num: -0.06, expected: '-6%' },
      { num: '3a', expected: '' },
    ].forEach(item => {
      test('it formats a number to a percentage', () => {
        const result = NumberUtils.formatPercentage(item.num, item.precision, item.roundValue);
        expect(result).toEqual(item.expected);
      });
    });
  });
});
