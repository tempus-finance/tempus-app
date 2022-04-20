import DecimalUtils from './DecimalUtils';

describe('DecimalUtils', () => {
  describe('formatWithMultiplier()', () => {
    [
      { value: 0, fractionDigits: undefined, expected: '0' },
      { value: 0, fractionDigits: 1, expected: '0.0' },
      { value: 0.0546, fractionDigits: 3, expected: '0.054' },
      { value: '0.000000000056', fractionDigits: 3, expected: '0.000' },
      { value: 0.0546, fractionDigits: 1, expected: '0.0' },
      { value: 12, fractionDigits: 1, expected: '12.0' },
      { value: 1234, fractionDigits: 1, expected: '1.2k' },
      { value: 100000000, fractionDigits: 1, expected: '100.0M' },
      { value: 299792458, fractionDigits: 1, expected: '299.8M' },
      { value: 759878, fractionDigits: 1, expected: '759.9k' },
      { value: 759878, fractionDigits: 0, expected: '760k' },
      { value: 123, fractionDigits: 1, expected: '123.0' },
      { value: 123.456, fractionDigits: 1, expected: '123.4' },
      { value: 123.456, fractionDigits: 2, expected: '123.45' },
      { value: 123.456, fractionDigits: 4, expected: '123.4560' },
      { value: -1000, fractionDigits: 0, expected: '-1k' },
      { value: '0', fractionDigits: undefined, expected: '0' },
      { value: '0', fractionDigits: 0, expected: '0' },
      { value: '0.0', fractionDigits: 2, expected: '0.00' },
      { value: '0.000000007631', fractionDigits: 2, expected: '0.00' },
      { value: '3.4', fractionDigits: 2, expected: '3.40' },
      { value: '123', fractionDigits: 3, expected: '123.000' },
      { value: '123.45678', fractionDigits: 0, expected: '123' },
      { value: '123.45678', fractionDigits: 2, expected: '123.45' },
      { value: '-123', fractionDigits: 3, expected: '-123.000' },
      { value: '-123.45678', fractionDigits: 0, expected: '-123' },
      { value: '-123.45678', fractionDigits: 2, expected: '-123.45' },
      { value: '7389', fractionDigits: undefined, expected: '7k' },
      { value: '7389', fractionDigits: 1, expected: '7.4k' },
      { value: '-7389', fractionDigits: 1, expected: '-7.4k' },
      { value: '63427184', fractionDigits: 0, expected: '63M' },
      { value: '63427184', fractionDigits: 2, expected: '63.43M' },
      { value: '-63427184', fractionDigits: 0, expected: '-63M' },
      { value: '-63427184', fractionDigits: 2, expected: '-63.43M' },
    ].forEach(({ value, fractionDigits, expected }) => {
      test(`${value} will be formatted to ${expected} with ${fractionDigits} fraction digits`, () => {
        expect(DecimalUtils.formatWithMultiplier(value, fractionDigits)).toEqual(expected);
      });
    });
  });

  describe('formatToCurrency()', () => {
    [
      { value: '0', fractionDigits: 1, symbol: undefined, expected: '0.0' },
      { value: '0', fractionDigits: 1, symbol: '$', expected: '$0.0' },
      { value: '0.0', fractionDigits: 1, symbol: undefined, expected: '0.0' },
      { value: '0.0', fractionDigits: 1, symbol: '$', expected: '$0.0' },
      { value: '12', fractionDigits: 1, symbol: '$', expected: '$12.0' },
      { value: '.12123', fractionDigits: 4, symbol: '$', expected: '$0.1212' },
      { value: '.12123124', fractionDigits: 3, symbol: '$', expected: '$0.121' },
      { value: '1234', fractionDigits: 1, symbol: '$', expected: '$1,234.0' },
      { value: '100000000', fractionDigits: 1, symbol: undefined, expected: '100,000,000.0' },
      { value: '299792458', fractionDigits: 1, symbol: undefined, expected: '299,792,458.0' },
      { value: '759878', fractionDigits: 1, symbol: '$', expected: '$759,878.0' },
      { value: '759878', fractionDigits: 0, symbol: undefined, expected: '759,878' },
      { value: '123', fractionDigits: 1, symbol: '$', expected: '$123.0' },
      { value: '123.456', fractionDigits: 1, symbol: '$', expected: '$123.4' },
      { value: '123.456', fractionDigits: 2, symbol: undefined, expected: '123.45' },
      { value: '123.456', fractionDigits: 0, symbol: undefined, expected: '123' },
      { value: '123123', fractionDigits: undefined, symbol: '$', expected: '$123,123.00' },
      { value: '123', fractionDigits: undefined, symbol: undefined, expected: '123.00' },
      { value: '123.4', fractionDigits: undefined, symbol: undefined, expected: '123.40' },
      { value: '123.456', fractionDigits: undefined, symbol: '$', expected: '$123.45' },
      { value: '123.456', fractionDigits: 4, symbol: '$', expected: '$123.4560' },
      { value: '123.0000000000011', fractionDigits: 1, symbol: '$', expected: '$123.0' },
      { value: '123.00000000456', fractionDigits: undefined, symbol: '$', expected: '$123.00' },
      { value: '123.0000000045', fractionDigits: 3, symbol: '$', expected: '$123.000' },
    ].forEach(({ value, fractionDigits, symbol, expected }) => {
      test(`${value} will be formatted to ${expected} (currency) with ${fractionDigits} fraction digits`, () => {
        expect(DecimalUtils.formatToCurrency(value, fractionDigits, symbol)).toEqual(expected);
      });
    });
  });

  describe('formatPercentage()', () => {
    [
      { value: 0, expected: '0.00%' },
      { value: 1, expected: '100.00%' },
      { value: 1, fractionDigits: 0, expected: '100%' },
      { value: 0.2, fractionDigits: 0, expected: '20%' },
      { value: 0.12345, fractionDigits: 2, expected: '12.34%' },
      { value: 0.987659, fractionDigits: 3, roundValue: true, expected: '98.766%' },
      { value: 0.987659, fractionDigits: 3, roundValue: false, expected: '98.765%' },
      { value: 0.05, expected: '5.00%' },
      { value: -0.06, expected: '-6.00%' },
    ].forEach(({ value, fractionDigits, roundValue, expected }) => {
      test(`${value} will be formatted to ${expected} (percentage) with ${fractionDigits} fraction digits`, () => {
        expect(DecimalUtils.formatPercentage(value, fractionDigits, roundValue)).toEqual(expected);
      });
    });
  });
});
