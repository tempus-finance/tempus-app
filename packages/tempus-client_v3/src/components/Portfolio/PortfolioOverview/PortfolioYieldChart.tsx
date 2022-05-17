import { FC, useCallback, useMemo } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { BalanceChartTooltipContent, ChartDot, DateChart, ChartDataPoint, ChartSizeProps } from '../../shared';

interface DataPoint extends ChartDataPoint<Date, number> {
  visible?: boolean;
  selected?: boolean;
}

const PortfolioYieldChart: FC<ChartSizeProps> = props => {
  const { width, height = 512 } = props;

  // TODO: Replace with real data
  const chartData = useMemo(
    () =>
      [...Array(20).keys()].map(value => ({
        x: new Date(2022, 4, 1 + value),
        y: (value * value) / 10000,
        visible: value === 5 || value === 18,
        selected: value === 5,
      })) as DataPoint[],
    [],
  );

  const topPercentageProjected = useMemo(
    () =>
      (chartData[chartData.length - 1].x.getTime() - Date.now()) /
      (chartData[chartData.length - 1].x.getTime() - chartData[0].x.getTime()),
    [chartData],
  );

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      if (chartData[index].visible) {
        return <ChartDot variant="plus" centerX={cx} centerY={cy} key={`chart-dot-${cx}-${cy}`} />;
      }
      return undefined;
    },
    [chartData],
  );

  const chartTooltipContent = useCallback(
    (x, y) => {
      const visible = chartData.find(value => value.x === x && value.y === y);
      return (
        <BalanceChartTooltipContent
          title={visible ? 'Deposit' : undefined}
          value={DecimalUtils.formatToCurrency(y)}
          currency="ETH"
          date={x}
        />
      );
    },
    [chartData],
  );

  return (
    <DateChart
      data={chartData}
      width={width}
      height={height}
      dot={chartDot}
      tooltipContent={chartTooltipContent}
      topPercentageProjected={topPercentageProjected}
    />
  );
};

export default PortfolioYieldChart;
