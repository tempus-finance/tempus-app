import { render } from '@testing-library/react';
import Tooltip, { TooltipProps } from './Tooltip';

const defaultProps: TooltipProps = {
  open: true,
};

const tooltipContentText = 'Tooltip Content';

const subject = (props: TooltipProps) =>
  render(
    <Tooltip {...props}>
      <p>{tooltipContentText}</p>
    </Tooltip>,
  );

describe('Tooltip', () => {
  it('renders child elements as content when tooltip is open', () => {
    const { container, getByText } = subject(defaultProps);

    const tooltipContent = getByText(tooltipContentText);

    expect(tooltipContent).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('does not render child elements as content when tooltip is closed', () => {
    const { container, queryByText } = subject({ open: false });

    const tooltipContent = queryByText(tooltipContentText);

    expect(tooltipContent).toBeNull();

    expect(container).toMatchSnapshot();
  });
});
