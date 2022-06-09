import { FC, memo, useCallback, useMemo } from 'react';
import { MaturityTerm } from '../../interfaces';
import { ChartDot, PercentageDateChart, SelectableChartDataPoint } from '../shared';

interface DepositModalChartProps {
  poolStartDate: Date;
  maturityTerms: MaturityTerm[];
  selectedMaturityTerm: MaturityTerm;
}

const DepositModalChart: FC<DepositModalChartProps> = props => {
  const { poolStartDate, maturityTerms, selectedMaturityTerm } = props;

  const chartData = useMemo(
    () =>
      maturityTerms.length && selectedMaturityTerm
        ? ([{ date: poolStartDate, apr: 0 }, ...maturityTerms].map(term => ({
            x: term.date,
            y: term.apr,
            visible: term.date !== poolStartDate,
            selected: term === selectedMaturityTerm,
          })) as SelectableChartDataPoint<Date, number>[])
        : undefined,
    [maturityTerms, poolStartDate, selectedMaturityTerm],
  );

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      if (!chartData) {
        return undefined;
      }

      const { visible, selected } = chartData[index];

      if (visible) {
        return <ChartDot variant="tick" selected={selected} centerX={cx} centerY={cy} key={`chart-dot-${cx}-${cy}`} />;
      }
      return undefined;
    },
    [chartData],
  );

  return chartData ? <PercentageDateChart height={329} data={chartData} dot={chartDot} /> : null;
};

export default memo(DepositModalChart);
