import { FC, ReactNode } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { ChartDataPoint, ChartDotElement, ChartCommonProps } from './Chart';
import DateChart from './DateChart';

export interface PercentageDateChartProps {
  data: ChartDataPoint<Date, number>[];
  topPercentageProjected?: number;
  dot?: ChartDotElement<number, number>;
  tooltipContent?: (x: Date, y: number) => ReactNode;
}

const PercentageDateChart: FC<PercentageDateChartProps & ChartCommonProps> = props => {
  const { data, width, height, tooltipContent, topPercentageProjected, dot, hideData } = props;

  return (
    <DateChart
      data={data}
      width={width}
      height={height}
      dot={dot}
      tooltipContent={tooltipContent}
      yTickFormatter={DecimalUtils.formatPercentage}
      topPercentageProjected={topPercentageProjected}
      hideData={hideData}
    />
  );
};

export default PercentageDateChart;
