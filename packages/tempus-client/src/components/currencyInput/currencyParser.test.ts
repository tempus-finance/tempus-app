import { formatValueToCurrency } from './currencyParser';

describe('formatValueToCurrency()', () => {
  [
    { value: 0.237, expected: '0.237' },
    { value: '0.88', expected: '0.88' },
    { value: 1, expected: '1' },
    { value: 1.0, expected: '1' },
    { value: '1.0', expected: '1.0' },
    { value: -1, expected: '1' },
    { value: 1000, expected: '1,000' },
    { value: '2000', expected: '2,000' },
    { value: 1234.5678, expected: '1,234.5678' },
  ].forEach(({ value, expected }) => {
    test(`when value is '${value}' the result should be '${expected}' `, () => {
      const result = formatValueToCurrency(value);

      expect(result).toBe(expected);
    });
  });
});
