import { FC, ReactNode } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { ChartDataPoint, ChartDot, ChartSizeProps } from './Chart';
import DateChart from './DateChart';

export interface PercentageDateChartProps {
  data: ChartDataPoint<Date, number>[];
  topPercentageProjected?: number;
  dot?: ChartDot<number, number>;
  tooltipContent?: (x: Date, y: number) => ReactNode;
}

const PercentageDateChart: FC<PercentageDateChartProps & ChartSizeProps> = props => {
  const { data, width, height, tooltipContent, topPercentageProjected, dot } = props;

  return (
    <DateChart
      data={data}
      width={width}
      height={height}
      dot={dot}
      tooltipContent={tooltipContent}
      yTickFormatter={DecimalUtils.formatPercentage}
      topPercentageProjected={topPercentageProjected}
    />
  );
};

export default PercentageDateChart;
