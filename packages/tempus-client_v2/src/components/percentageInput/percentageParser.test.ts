import { formatValueToPercentage } from './percentageParser';

describe('formatValueToPercentage()', () => {
  [
    { value: '', expected: { parsedValue: '', percentageValue: '' } },
    { value: '0.237', expected: { parsedValue: '0.23', percentageValue: '0.23' } },
    { value: '0.88', expected: { parsedValue: '0.88', percentageValue: '0.88' } },
    { value: '0.001', expected: { parsedValue: '0.00', percentageValue: '0.00' } },
    { value: '1', expected: { parsedValue: '1', percentageValue: '1' } },
    { value: '1.0', expected: { parsedValue: '1.0', percentageValue: '1.0' } },
    { value: '-1', expected: { parsedValue: '0', percentageValue: '0' } },
    { value: '-1.2854', expected: { parsedValue: '0', percentageValue: '0' } },
    { value: '1000,', expected: { parsedValue: '100', percentageValue: '100' } },
    { value: '1234.5678', expected: { parsedValue: '100', percentageValue: '100' } },
  ].forEach(({ value, expected }) => {
    test(`when value is '${value}' the result should be '${expected.parsedValue} ${expected.percentageValue}' `, () => {
      const result = formatValueToPercentage(value);

      expect(result).toEqual(expected);
    });
  });
});
