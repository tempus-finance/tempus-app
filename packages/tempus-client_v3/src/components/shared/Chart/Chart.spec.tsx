import { render } from '@testing-library/react';
import Chart, { ChartProps, ChartSizeProps } from './Chart';

const numericData = [...Array(20).keys()].map(value => ({ x: value, y: value * value }));

const defaultProps: ChartProps & ChartSizeProps = {
  width: 500,
  height: 300,
};

const subject = (props: ChartProps & ChartSizeProps) => render(<Chart {...props} />);

describe('Chart', () => {
  let originalConsoleWarn: (...consoleData: any[]) => void = () => {};

  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it('renders a numeric linear chart', () => {
    const { container } = subject({ ...defaultProps, data: numericData });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a numeric linear chart with projected values', () => {
    const { container } = subject({ ...defaultProps, data: numericData, topPercentageProjected: 0.2 });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
