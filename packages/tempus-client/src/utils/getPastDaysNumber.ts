import { DateTime } from 'luxon';

export default function getPastDaysNumber(lastDaysCount: number, every: number): number[] {
  const pastDaysNumber: number[] = [];

  for (let i = 0; i < lastDaysCount; i += every) {
    const currentDate = DateTime.now();

    pastDaysNumber.push(Number(currentDate.minus({ days: i }).toFormat('d')));
  }

  return pastDaysNumber.reverse();
}
