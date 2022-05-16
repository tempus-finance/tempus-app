import { FC, useCallback, useMemo } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { BalanceChartTooltipContent, ChartDot, DateChart } from '../../shared';
import { ChartDataPoint } from '../../shared/Chart/Chart';

type TransactionType = 'deposit' | 'withdraw';

interface DataPoint extends ChartDataPoint<Date, number> {
  transactionType: TransactionType;
}

const PortfolioValueChart: FC = () => {
  // TODO: Replace with real data
  const chartData = useMemo(
    () =>
      [
        { x: new Date(2022, 4, 1), y: 0.24 },
        { x: new Date(2022, 4, 4), y: 0.28 },
        { x: new Date(2022, 4, 10), y: 0.18 },
        { x: new Date(2022, 4, 10), y: 0.5, transactionType: 'deposit' },
        { x: new Date(2022, 4, 14), y: 0.52 },
        { x: new Date(2022, 4, 14), y: 0.38, transactionType: 'withdraw' },
        { x: new Date(2022, 4, 20), y: 0.8, transactionType: 'deposit' },
      ] as DataPoint[],
    [],
  );

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      const { transactionType } = chartData[index];

      if (transactionType !== undefined) {
        return <ChartDot variant={transactionType === 'deposit' ? 'plus' : 'minus'} centerX={cx} centerY={cy} />;
      }
      return undefined;
    },
    [chartData],
  );

  const tooltipContent = useCallback(
    (x, y) => <BalanceChartTooltipContent value={DecimalUtils.formatToCurrency(y)} currency="ETH" date={x} />,
    [],
  );

  return <DateChart data={chartData} height={512} dot={chartDot} tooltipContent={tooltipContent} />;
};

export default PortfolioValueChart;
