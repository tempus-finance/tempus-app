import { render } from '@testing-library/react';
import FeeTooltip, { FeeTooltipFees, FeeTooltipProps } from './FeeTooltip';

const fees: FeeTooltipFees = {
  deposit: 0,
  redemption: 0,
  earlyRedemption: 0.003,
  swap: 0.002,
};

const defaultProps: FeeTooltipProps = {
  open: true,
  fees: fees,
};

const subject = (props: FeeTooltipProps) => render(<FeeTooltip {...props} />);

describe('FeeTooltip', () => {
  it('renders a fee tooltip', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a fee tooltip with all fees set to 0', () => {
    const { container } = subject({ open: true, fees: {} });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
