import { formatValueToCurrency } from './currencyParser';

describe('formatValueToCurrency()', () => {
  [
    { value: '', expected: '' },
    { value: '0.237', expected: '0.237' },
    { value: '0.88', expected: '0.88' },
    { value: '0.001', expected: '0.001' },
    { value: '1', expected: '1' },
    { value: '1.0', expected: '1.0' },
    { value: '-1', expected: '1' },
    { value: '1000,', expected: '1,000' },
    { value: '2000', expected: '2,000' },
    { value: '1234.5678', expected: '1,234.5678' },
    { value: '1234.005678', expected: '1,234.005678' },
  ].forEach(({ value, expected }) => {
    test(`when value is '${value}' the result should be '${expected}' `, () => {
      const result = formatValueToCurrency(value);

      expect(result).toBe(expected);
    });
  });
});

describe('formatValueToCurrency() with precision', () => {
  [
    { value: '', precision: 4, expected: '' },
    { value: '0.237', precision: 4, expected: '0.237' },
    { value: '1.456', precision: 2, expected: '1.45' },
    { value: '1.0000', precision: 2, expected: '1.00' },
    { value: '-0.9876', precision: 1, expected: '0.9' },
  ].forEach(({ value, precision, expected }) => {
    test(`when value is '${value}' the result should be '${expected}' `, () => {
      const result = formatValueToCurrency(value, precision);

      expect(result).toBe(expected);
    });
  });
});
