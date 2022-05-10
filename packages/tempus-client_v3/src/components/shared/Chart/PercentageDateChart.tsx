import { FC } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { ChartDataPoint, ChartSizeProps } from './Chart';
import DateChart from './DateChart';

interface PercentageDateChartProps {
  data: ChartDataPoint<Date, number>[];
  topPercentageProjected?: number;
}

const PercentageDateChart: FC<PercentageDateChartProps & ChartSizeProps> = props => {
  const { data, width, height, topPercentageProjected } = props;

  return (
    <DateChart
      data={data}
      width={width}
      height={height}
      yTickFormatter={DecimalUtils.formatPercentage}
      topPercentageProjected={topPercentageProjected}
    />
  );
};

export default PercentageDateChart;
