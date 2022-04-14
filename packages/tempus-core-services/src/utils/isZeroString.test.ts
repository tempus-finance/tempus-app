import { isZeroString } from './isZeroString';

describe('isZeroString()', () => {
  [
    { input: '0', expected: true },
    { input: '', expected: true },
    { input: 'zero', expected: true },
    { input: '1', expected: false },
    { input: '-1', expected: false },
    { input: '1.1', expected: false },
    { input: '0.2', expected: false },
    { input: '-3.14', expected: false },
    { input: '-0.005', expected: false },
  ].forEach(item => {
    test(`it returns '${item.expected}' when the input is ${item.input}`, () => {
      const result = isZeroString(item.input);
      expect(result).toBe(item.expected);
    });
  });
});
