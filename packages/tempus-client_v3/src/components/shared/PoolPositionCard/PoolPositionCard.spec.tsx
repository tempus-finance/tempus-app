import { fireEvent, render } from '@testing-library/react';
import { Decimal } from 'tempus-core-services';
import I18nProvider from '../../../i18n/I18nProvider';
import PoolPositionCard, { PoolPositionCardProps } from './PoolPositionCard';

const defaultProps: PoolPositionCardProps = {
  apr: 0.1,
  term: new Date(2022, 2, 4),
  profitLoss: new Decimal(10.29651),
  balance: new Decimal(20.9294),
  totalYieldEarned: new Decimal(1.12345),
  projectedTotalYield: new Decimal(3.181215),
  tokenExchangeRate: new Decimal(2000),
  tokenDecimals: 4,
  tokenTicker: 'ETH',
};

const subject = (props: PoolPositionCardProps) =>
  render(
    <I18nProvider>
      <PoolPositionCard {...props} />
    </I18nProvider>,
  );

describe('WalletButton', () => {
  it('renders a collapsed pool position card', () => {
    const { container, getByText } = subject(defaultProps);

    const actualText = getByText('See more');
    expect(actualText).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('expands pool position card when user clicks on see more', () => {
    const { container, queryByRole, getByText } = subject(defaultProps);

    const actualButton = queryByRole('button');
    expect(actualButton).not.toBeNull();

    fireEvent.click(actualButton as Element);

    const actualText = getByText('See less');
    expect(actualText).not.toBeNull();

    expect(container).toMatchSnapshot();
  });
});
