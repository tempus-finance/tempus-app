import { render } from '@testing-library/react';
import { ChartSizeProps } from './Chart';
import PercentageDateChart, { PercentageDateChartProps } from './PercentageDateChart';

const data = [...Array(20).keys()].map(value => ({
  x: new Date(2022, 3, 1 + value),
  y: (value * value) / 10000,
}));

const defaultProps: PercentageDateChartProps & ChartSizeProps = {
  width: 500,
  height: 300,
};

const subject = (props: PercentageDateChartProps & ChartSizeProps) => render(<PercentageDateChart {...props} />);

describe('PercentageDateChart', () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it('renders a yield chart', () => {
    const { container } = subject({ ...defaultProps, data });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
