import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Chain, Decimal as MockDecimal } from 'tempus-core-services';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../../setupTests';
import PortfolioOverview from './PortfolioOverview';

jest.mock('@web3-onboard/react', () => ({
  useConnectWallet: jest.fn().mockReturnValue(['test-wallet-address', jest.fn()]),
}));

const subject = () =>
  render(
    <BrowserRouter>
      <PortfolioOverview />
    </BrowserRouter>,
  );

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useSelectedChain: jest.fn().mockReturnValue(['ethereum' as Chain, () => {}]),
  usePoolBalances: jest.fn().mockReturnValue({
    [`${mockPool1.chain}-${mockPool1.address}`]: {
      balanceInUsd: new MockDecimal(100),
    },
    [`${mockPool2.chain}-${mockPool2.address}`]: {
      balanceInUsd: new MockDecimal(23.45),
    },
  }),
  useUserDepositedPools: jest.fn().mockReturnValue([mockPool1, mockPool2]),
  useWalletAddress: jest.fn().mockReturnValue(['test-wallet-address']),
}));

describe('PortfolioOverview', () => {
  it('renders portfolio overview with yield chart', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders portfolio overview with value chart', () => {
    const { container } = subject();

    const chartTabs = container.querySelectorAll('.tc__tabs__tab');

    expect(chartTabs).toHaveLength(2);

    fireEvent.click(chartTabs[1]);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
