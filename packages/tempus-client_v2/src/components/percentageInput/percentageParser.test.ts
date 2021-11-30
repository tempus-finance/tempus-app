import { formatValueToPercentage } from './percentageParser';

describe('formatValueToPercentage()', () => {
  [
    { value: '', expected: '' },
    { value: '0.237', expected: '0.23' },
    { value: '0.88', expected: '0.88' },
    { value: '0.001', expected: '0.00' },
    { value: '1', expected: '1' },
    { value: '1.0', expected: '1.0' },
    { value: '-1', expected: '0' },
    { value: '-1.2854', expected: '0' },
    { value: '1000,', expected: '100' },
    { value: '1234.5678', expected: '100' },
  ].forEach(({ value, expected }) => {
    test(`when value is '${value}' the result should be '${expected}' `, () => {
      const result = formatValueToPercentage(value);

      expect(result).toEqual(expected);
    });
  });
});
