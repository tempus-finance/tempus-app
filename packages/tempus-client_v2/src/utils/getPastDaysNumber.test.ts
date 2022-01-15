import getPastDaysNumber from './getPastDaysNumber';

import sub from 'date-fns/sub';
import format from 'date-fns/format';

describe('getPastDaysNumber()', () => {
  test('it returns an array of numbers that represent specified past number of days with specified interval', () => {
    const currentDate = new Date();

    const daysNumber = getPastDaysNumber(3, 1);
    expect(daysNumber).toStrictEqual([
      Number(format(sub(currentDate, { days: 2 }), 'd')),
      Number(format(sub(currentDate, { days: 1 }), 'd')),
      Number(format(sub(currentDate, { days: 0 }), 'd')),
    ]);
  });
});
