import getRangeFrom from './getRangeFrom';

describe('getRangeFrom', () => {
  test('return the range of an unsorted number array', () => {
    for (let i = 0; i < 10; i++) {
      const inputs = new Array(10).fill(0).map(() => Math.random());
      const min = Math.min(...inputs.filter(input => !!input));
      const max = Math.max(...inputs.filter(input => !!input));

      expect(getRangeFrom<number>(inputs)).toEqual([min, max]);
    }
  });

  test('return the range of an unsorted number array (including zero)', () => {
    for (let i = 0; i < 10; i++) {
      const inputs = new Array(10)
        .fill(0)
        .map(() => Math.random())
        .concat([0, 0, 0]);
      const min = Math.min(...inputs.filter(input => !!input));
      const max = Math.max(...inputs.filter(input => !!input));

      expect(getRangeFrom<number>(inputs)).toEqual([min, max]);
    }
  });

  test('return the range of an unsorted string array', () => {
    for (let i = 0; i < 10; i++) {
      const inputs = new Array(10).fill(0).map(() => Math.random().toString(36).substring(2));
      const sorted = inputs.slice().sort();

      expect(getRangeFrom<string>(inputs)).toEqual([sorted[0], sorted[sorted.length - 1]]);
    }
  });

  test('return the range of an unsorted string array (including empty string)', () => {
    for (let i = 0; i < 10; i++) {
      const inputs = new Array(10)
        .fill(0)
        .map(() => Math.random().toString(36).substring(2))
        .concat(['', '', '']);
      const sorted = inputs.filter(input => !!input).sort();

      expect(getRangeFrom<string>(inputs)).toEqual([sorted[0], sorted[sorted.length - 1]]);
    }
  });

  test('return the range of an unsorted Date array', () => {
    for (let i = 0; i < 10; i++) {
      const inputs = new Array(10).fill(0).map(() => new Date(Date.now() - Math.round(Math.random() * 10000000)));
      const sorted = inputs.slice().sort();

      expect(getRangeFrom<Date>(inputs)).toEqual([sorted[0], sorted[sorted.length - 1]]);
    }
  });
});
