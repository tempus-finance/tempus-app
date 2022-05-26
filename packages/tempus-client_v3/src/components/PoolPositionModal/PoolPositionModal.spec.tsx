import { render } from '@testing-library/react';
import { Decimal } from 'tempus-core-services';
import { PoolPositionModal } from './PoolPositionModal';

const subject = () =>
  render(
    <PoolPositionModal
      apr={0.1}
      balance={new Decimal(20)}
      chartData={[
        { x: new Date(2022, 3, 4), y: 10 },
        { x: new Date(2022, 4, 1), y: 20 },
      ]}
      profitLoss={new Decimal(2)}
      projectedTotalYield={new Decimal(3)}
      term={new Date(2022, 4, 2)}
      tokenDecimals={4}
      tokenExchangeRate={new Decimal(100)}
      totalYieldEarned={new Decimal(2)}
      tokenTicker="ETH"
      protocol="lido"
      address="0x123123123"
      backingToken="ETH"
      chain="ethereum"
    />,
  );

describe('PoolPositionModal', () => {
  it('renders a pool position modal', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
