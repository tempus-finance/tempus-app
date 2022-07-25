import { FC, useCallback, useMemo } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { useLocale, useUserDepositedPools } from '../../../hooks';
import { BalanceChartTooltipContent, ChartDot, DateChart } from '../../shared';
import { ChartDataPoint, ChartCommonProps } from '../../shared/Chart/Chart';
import { generateDummyDateChartData } from '../../shared/Chart/utils';

type TransactionType = 'deposit' | 'withdraw';

interface DataPoint extends ChartDataPoint<Date, number> {
  transactionType?: TransactionType;
}

const PortfolioValueChart: FC<ChartCommonProps> = props => {
  const { width, height = 512 } = props;
  const userDepositedPools = useUserDepositedPools();
  const [locale] = useLocale();

  // TODO: When the Graph is integrated, we should hide the chart based on the data from the graph instead of using
  // current positions.
  const hideData = !userDepositedPools.length;

  const chartData = useMemo((): DataPoint[] => {
    if (hideData) {
      // Generates some dummy data that won't be shown in the graph, but will force showing axes
      return generateDummyDateChartData();
    }

    // TODO: Replace with real data
    return [
      { x: new Date(2022, 4, 1), y: 0.24 },
      { x: new Date(2022, 4, 4), y: 0.28 },
      { x: new Date(2022, 4, 10), y: 0.18 },
      { x: new Date(2022, 4, 10), y: 0.5, transactionType: 'deposit' },
      { x: new Date(2022, 4, 14), y: 0.52 },
      { x: new Date(2022, 4, 14), y: 0.38, transactionType: 'withdraw' },
      { x: new Date(2022, 4, 20), y: 0.8, transactionType: 'deposit' },
    ];
  }, [hideData]);

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      const { transactionType } = chartData[index];

      if (transactionType !== undefined) {
        return (
          <ChartDot
            variant={transactionType === 'deposit' ? 'plus' : 'minus'}
            centerX={cx}
            centerY={cy}
            key={`chart-dot-${cx}-${cy}`}
          />
        );
      }
      return undefined;
    },
    [chartData],
  );

  const tooltipContent = useCallback(
    (x, y) => (
      <BalanceChartTooltipContent value={DecimalUtils.formatToCurrency(y)} currency="USD" date={x} locale={locale} />
    ),
    [locale],
  );

  return <DateChart data={chartData} width={width} height={height} dot={chartDot} tooltipContent={tooltipContent} />;
};

export default PortfolioValueChart;
