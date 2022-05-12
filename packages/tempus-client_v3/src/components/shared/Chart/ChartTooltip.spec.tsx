import { render } from '@testing-library/react';
import ChartTooltip, { ChartTooltipProps } from './ChartTooltip';

const defaultProps: ChartTooltipProps = {
  tooltipContent: (x: number, y: number) => (
    <div style={{ width: 300, height: 300 }}>
      X: {x}
      Y: {y}
    </div>
  ),
  payload: [
    {
      payload: {
        x: 100,
        y: 200,
      },
    },
  ],
};

const subject = (props: ChartTooltipProps) => render(<ChartTooltip {...props} />);

describe('ChartTooltip', () => {
  it('renders a chart tooltip with left placement', () => {
    const { container } = subject({ ...defaultProps, coordinate: { x: 100 }, viewBox: { width: 150 } });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a chart tooltip with right placement', () => {
    const { container } = subject({ ...defaultProps, coordinate: { x: 10 }, viewBox: { width: 150 } });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
