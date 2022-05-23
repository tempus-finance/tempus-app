import { fireEvent, render } from '@testing-library/react';
import FeeTooltip, { FeeTooltipFees, FeeTooltipProps } from './FeeTooltip';

const fees: FeeTooltipFees = {
  deposit: 0,
  redemption: 0,
  earlyRedemption: 0.003,
  swap: 0.002,
};

const defaultProps: FeeTooltipProps = {
  fees,
};

const subject = (props: FeeTooltipProps) => render(<FeeTooltip {...props}>Click</FeeTooltip>);

describe('FeeTooltip', () => {
  it('renders a fee tooltip', () => {
    const { container, getByText } = subject(defaultProps);

    const actualButton = getByText('Click');

    expect(actualButton).not.toBeNull();

    fireEvent.click(actualButton);

    const tooltip = container.querySelector('.tc__tooltip');

    expect(tooltip).not.toBeNull();
    expect(tooltip).toMatchSnapshot();
  });

  it('renders a fee tooltip with all fees set to 0', () => {
    const { container, getByText } = subject({ fees: {} });

    const actualButton = getByText('Click');

    expect(actualButton).not.toBeNull();

    fireEvent.click(actualButton);

    const tooltip = container.querySelector('.tc__tooltip');

    expect(tooltip).not.toBeNull();
    expect(tooltip).toMatchSnapshot();
  });

  it('does not render a fee tooltip if it is not opened', () => {
    const { container, getByText } = subject(defaultProps);

    const actualButton = getByText('Click');

    expect(actualButton).not.toBeNull();

    const tooltip = container.querySelector('.tc__tooltip');

    expect(tooltip).toBeNull();
  });
});
