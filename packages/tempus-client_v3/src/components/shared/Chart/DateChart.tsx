import { FC, ReactNode, useCallback, useMemo } from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useLocale } from '../../../hooks';
import Typography from '../Typography';
import Chart, { ChartDataPoint, ChartDot, ChartSizeProps, ChartTick } from './Chart';

export interface DateChartProps {
  data: ChartDataPoint<Date, number>[];
  yTick?: ChartTick;
  yTickFormatter?: (value: number, index: number) => string;
  topPercentageProjected?: number;
  dot?: ChartDot<number, number>;
  tooltipContent?: (x: Date, y: number) => ReactNode;
}

const DateChart: FC<DateChartProps & ChartSizeProps> = props => {
  const { data, width, height, tooltipContent, yTick, yTickFormatter, topPercentageProjected, dot } = props;
  const [locale] = useLocale();

  const transformedData = useMemo(() => data.map(value => ({ x: value.x.getTime(), y: value.y })), [data]);

  const adaptedTooltipContent = useCallback(
    (x: number, y: number) => tooltipContent?.(new Date(x), y),
    [tooltipContent],
  ) as (x: NameType, y: ValueType) => ReactNode;

  const xTick = useCallback(
    tickProps => {
      const date = new Date(tickProps.payload.value);
      return (
        <foreignObject
          className="tc__chart__tick-container tc__chart__date-tick-container"
          x={tickProps.x}
          y={tickProps.y}
        >
          <div className="tc__chart__date-tick">
            <Typography variant="body-secondary" type="mono" weight="medium">
              {date.toLocaleDateString(locale, { day: '2-digit' })}
            </Typography>
            <Typography variant="body-secondary" weight="medium">
              {date.toLocaleDateString(locale, { month: 'short' })}
            </Typography>
          </div>
        </foreignObject>
      );
    },
    [locale],
  );

  return (
    <Chart
      data={transformedData}
      width={width}
      height={height}
      tooltipContent={tooltipContent ? adaptedTooltipContent : undefined}
      xAxisType="number"
      xScale="utc"
      xTick={xTick}
      yAxisType="number"
      yTick={yTick}
      yTickFormatter={yTickFormatter}
      margin={{ top: 5, bottom: 40, right: 5 }}
      dot={dot}
      topPercentageProjected={topPercentageProjected}
    />
  );
};

export default DateChart;
