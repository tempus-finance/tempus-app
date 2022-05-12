import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DecimalUtils } from 'tempus-core-services';
import BalanceChartTooltipContent from './BalanceChartTooltipContent';
import Chart, { ChartDataPoint } from './Chart';
import ChartDot from './ChartDot';
import DateChart from './DateChart';
import PercentageDateChart from './PercentageDateChart';

export default {
  title: 'Chart',
  component: Chart,
  argTypes: {},
} as ComponentMeta<typeof Chart>;

interface DataPoint extends ChartDataPoint<Date, number> {
  visible?: boolean;
  selected?: boolean;
}

const data = [...Array(20).keys()].map(value => ({
  x: new Date(2022, 3, 1 + value),
  y: (value * value) / 10,
  visible: value === 5 || value === 18,
  selected: value === 5,
})) as DataPoint[];

const DateTemplate: ComponentStory<typeof DateChart> = props => <DateChart {...props} height={400} data={data} />;

const PercentageDateTemplate: ComponentStory<typeof PercentageDateChart> = props => {
  const modifiedData = data.map(value => {
    const newValue = value;
    newValue.y /= 1000;
    return newValue;
  });
  return <PercentageDateChart {...props} height={400} data={modifiedData} />;
};

export const BasicDateChart = DateTemplate.bind({});

export const DateChartWithProjectedValue = DateTemplate.bind({});
DateChartWithProjectedValue.args = {
  topPercentageProjected: 0.2,
};

export const DateChartWithTooltip = DateTemplate.bind({});
DateChartWithTooltip.args = {
  tooltipContent: (x, y) => (
    <BalanceChartTooltipContent title="Deposit" value={DecimalUtils.formatToCurrency(y, 1)} currency="ETH" date={x} />
  ),
};

export const DateChartWithDots = DateTemplate.bind({});
DateChartWithDots.args = {
  dot: (_x, _y, index, cx, cy) => {
    const { visible, selected } = data[index];
    if (visible) {
      return <ChartDot variant="tick" centerX={cx} centerY={cy} selected={selected} />;
    }
    return undefined;
  },
};

export const BasicPercentageDateChart = PercentageDateTemplate.bind({});
