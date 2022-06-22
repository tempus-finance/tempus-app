import { render } from '@testing-library/react';
import Chart, { ChartProps, ChartCommonProps } from './Chart';

const numericData = [...Array(20).keys()].map(value => ({ x: value, y: value * value }));

const defaultProps: Partial<ChartProps<number, number> & ChartCommonProps> = {
  width: 500,
  height: 300,
};

const subject = (props: ChartProps<number, number> & ChartCommonProps) => render(<Chart {...props} />);

describe('Chart', () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
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
