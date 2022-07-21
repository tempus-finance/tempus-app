import { timeago } from './timeago';

describe('timeago()', () => {
  const now = Date.now();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  [
    { timestamp: now, expected: '0s' },
    { timestamp: now - 1000, expected: '1s' },
    { timestamp: now - 10000, expected: '10s' },
    { timestamp: now - 100000, expected: '1m' },
    { timestamp: now - 1000000, expected: '16m' },
    { timestamp: now - 10000000, expected: '2h' },
    { timestamp: now - 100000000, expected: '1d' },
    { timestamp: now - 1000000000, expected: '1w' },
    { timestamp: now - 10000000000, expected: '16w' },
    { timestamp: now - 100000000000, expected: '3y' },
    { timestamp: now - 1000000000000, expected: '31y' },
  ].forEach(({ timestamp, expected }) => {
    test(`it returns a shortened time string ${expected}`, () => {
      expect(timeago(timestamp)).toEqual(expected);
    });
  });
});
