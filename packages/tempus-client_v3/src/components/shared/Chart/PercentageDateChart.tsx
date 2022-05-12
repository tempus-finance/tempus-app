import { FC, ReactElement, ReactNode } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { ChartDataPoint, ChartSizeProps } from './Chart';
import DateChart from './DateChart';

interface PercentageDateChartProps {
  data: ChartDataPoint<Date, number>[];
  topPercentageProjected?: number;
  dot?: (
    dataX: number,
    dataY: number,
    index: number,
    dotCenterX: number,
    dotCenterY: number,
  ) => ReactElement<SVGElement> | undefined;
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
