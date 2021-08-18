import sub from 'date-fns/sub';
import format from 'date-fns/format';

export default function getPastDaysNumber(lastDaysCount: number, every: number): number[] {
  const pastDaysNumber: number[] = [];

  const currentDate = new Date();
  for (let i = 0; i < lastDaysCount; i += every) {
    const targetDate = sub(currentDate, { days: i });
    const formattedDate = format(targetDate, 'd');

    pastDaysNumber.push(Number(formattedDate));
  }

  return pastDaysNumber.reverse();
}
