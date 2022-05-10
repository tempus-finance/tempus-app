import { ReactElement, SVGProps, useCallback } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Margin, ScaleType } from 'recharts/types/util/types';
import { colors } from '../Colors';
import Typography from '../Typography';
import './Chart.scss';

type ChartAxisType = 'number' | 'category';

export type ChartTick =
  | SVGProps<SVGTextElement>
  | ReactElement<SVGElement>
  | ((props: any) => ReactElement<SVGElement>)
  | boolean;

export interface ChartDataPoint<X, Y> {
  x: X;
  y: Y;
}

interface ChartProps<X, Y> {
  data: ChartDataPoint<X, Y>[];
  xAxisType?: ChartAxisType;
  xScale?: ScaleType;
  xTick?: ChartTick;
  xTickFormatter?: (value: X, index: number) => string;
  yAxisType?: ChartAxisType;
  yScale?: ScaleType;
  yTick?: ChartTick;
  yTickFormatter?: (value: Y, index: number) => string;
  margin?: Margin;
  topPercentageProjected?: number;
}

export interface ChartSizeProps {
  width?: string | number;
  height?: string | number;
}

function Chart<X, Y>(props: ChartProps<X, Y> & ChartSizeProps): ReactElement<ChartProps<X, Y> & ChartSizeProps> {
  const {
    data,
    width,
    height,
    xAxisType,
    xScale = 'linear',
    xTick,
    xTickFormatter,
    yAxisType,
    yScale = 'linear',
    yTick,
    yTickFormatter,
    margin,
    topPercentageProjected,
  } = props;

  const textTick = useCallback(
    tickProps => (
      <foreignObject
        className="tc__chart__tick-container tc__chart__text-tick-container"
        x={tickProps.x}
        y={tickProps.y}
      >
        <Typography variant="body-secondary">
          {tickProps.tickFormatter?.(tickProps.payload.value) ?? tickProps.payload.value}
        </Typography>
      </foreignObject>
    ),
    [],
  );

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={data} margin={margin}>
        <defs>
          <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
            <stop offset="67%" stopColor={colors.chartArea} stopOpacity={0.2} />
            <stop offset="100%" stopColor={colors.chartArea} stopOpacity={0} />
          </linearGradient>
          <pattern id="pattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
            <rect fill={colors.chartStroke} opacity="0.2" x="0" y="0" width="100%" height="100%" />
            <line stroke="#000000" opacity="0.3" strokeWidth="2px" y2="4" />
          </pattern>
          {topPercentageProjected && (
            <clipPath id="projectedValueClip">
              <rect x={`${(1 - topPercentageProjected) * 100}%`} y="0" width="100%" height="100%" />
            </clipPath>
          )}
        </defs>
        <XAxis
          dataKey="x"
          type={xAxisType}
          scale={xScale}
          tick={xTick ?? textTick}
          tickFormatter={xTickFormatter}
          tickLine={false}
          domain={['dataMin', 'dataMax']}
          interval="preserveStartEnd"
        />
        <YAxis
          dataKey="y"
          type={yAxisType}
          scale={yScale}
          axisLine={false}
          tick={yTick ?? textTick}
          tickFormatter={yTickFormatter}
          tickLine={false}
          domain={['dataMin', 'dataMax']}
          interval="preserveStartEnd"
        />
        <CartesianGrid stroke={colors.chartGrid} horizontal vertical={false} />
        <Area type="monotone" dataKey="y" stroke={colors.chartStroke} strokeWidth={2} fill="url(#color)" />
        {topPercentageProjected && (
          <Area type="monotone" dataKey="y" strokeWidth={0} clipPath="url(#projectedValueClip)" fill="url(#pattern)" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default Chart;
