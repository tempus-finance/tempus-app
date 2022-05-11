import { FC, ReactNode } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { ChartDataPoint, ChartSizeProps } from './Chart';
import DateChart from './DateChart';

interface PercentageDateChartProps {
  data: ChartDataPoint<Date, number>[];
  topPercentageProjected?: number;
  tooltipContent?: (x: Date, y: number) => ReactNode;
}

const PercentageDateChart: FC<PercentageDateChartProps & ChartSizeProps> = props => {
  const { data, width, height, tooltipContent, topPercentageProjected } = props;

  return (
    <DateChart
      data={data}
      width={width}
      height={height}
      tooltipContent={tooltipContent}
      yTickFormatter={DecimalUtils.formatPercentage}
      topPercentageProjected={topPercentageProjected}
    />
  );
};

export default PercentageDateChart;
