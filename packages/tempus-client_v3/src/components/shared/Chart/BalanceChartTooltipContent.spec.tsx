import { render } from '@testing-library/react';
import BalanceChartTooltipContent, { BalanceChartTooltipContentProps } from './BalanceChartTooltipContent';

const defaultProps: BalanceChartTooltipContentProps = {
  title: 'Deposit',
  value: '0.123',
  currency: 'ETH',
  date: new Date(Date.UTC(2022, 4, 1)),
};

const subject = (props: BalanceChartTooltipContentProps) => render(<BalanceChartTooltipContent {...props} />);

describe('BalanceChartTooltipContent', () => {
  it('renders a balance tooltip content', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
