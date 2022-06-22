import { ChartDataPoint } from './Chart';

export function generateDummyDateChartData(): ChartDataPoint<Date, number>[] {
  const now = new Date();

  return [...Array(20).keys()].map(value => {
    const newDate = new Date();
    newDate.setDate(now.getDate() + value);

    return {
      x: newDate,
      y: value * value,
    };
  });
}
