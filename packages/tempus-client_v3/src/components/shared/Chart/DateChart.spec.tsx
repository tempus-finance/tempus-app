import { render } from '@testing-library/react';
import { ChartSizeProps } from './Chart';
import DateChart, { DateChartProps } from './DateChart';

const data = [...Array(20).keys()].map(value => ({
  x: new Date(2022, 3, 1 + value),
  y: value * value,
}));

const defaultProps: DateChartProps & ChartSizeProps = {
  width: 500,
  height: 300,
};

const subject = (props: DateChartProps & ChartSizeProps) => render(<DateChart {...props} />);

describe('DateChart', () => {
  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
    console.warn = jest.fn();
  });

  it('renders a date chart', () => {
    const { container } = subject({ ...defaultProps, data });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
