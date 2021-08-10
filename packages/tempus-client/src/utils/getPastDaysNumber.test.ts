import getPastDaysNumber from './getPastDaysNumber';

const { DateTime } = jest.requireActual('luxon');

describe('getPastDaysNumber()', () => {
  test('it returns an array of numbers that represent specified past number of days with specified interval', () => {
    DateTime.now = jest.fn().mockReturnValue(DateTime.fromISO('2021-01-01T00:00:00.000Z'));

    const daysNumber = getPastDaysNumber(10, 3);
    expect(daysNumber).toStrictEqual([23, 26, 29, 1]);
  });
});
