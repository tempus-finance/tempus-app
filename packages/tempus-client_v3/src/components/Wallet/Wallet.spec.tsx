import { fireEvent, render, waitFor } from '@testing-library/react';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BrowserRouter } from 'react-router-dom';
import { Chain, chainNameToHexChainId, Decimal, ZERO_ADDRESS } from 'tempus-core-services';
import { useSelectedChain, useTokenBalance } from '../../hooks';
import Wallet, { WalletProps } from './Wallet';

const mockConnect = jest.fn();
const mockSetChain = jest.fn();

const subject = (props: WalletProps) =>
  render(
    <BrowserRouter>
      <Wallet {...props} />
    </BrowserRouter>,
  );

jest.mock('@web3-onboard/ledger', () =>
  jest.fn().mockImplementation(() => () => ({
    label: '',
    getIcon: () => new Promise<string>(() => ''),
    getInterface: () => null,
  })),
);

jest.mock('@web3-onboard/gnosis', () =>
  jest.fn().mockImplementation(() => () => ({
    label: '',
    getIcon: () => new Promise<string>(() => ''),
    getInterface: () => null,
  })),
);

jest.mock('@web3-onboard/injected-wallets', () =>
  jest.fn().mockImplementation(() => () => ({
    label: '',
    getIcon: () => new Promise<string>(() => ''),
    getInterface: () => null,
  })),
);

jest.mock('@web3-onboard/react', () => ({
  init: jest.fn(),
  useConnectWallet: jest.fn(),
  useSetChain: jest.fn(),
  useWallets: jest.fn().mockReturnValue([]),
}));

jest.mock('react-blockies', () => () => (
  <canvas className="identicon" width="24" height="24" style={{ width: '24px', height: '24px' }} />
));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useSelectedChain: jest.fn(),
  useTokenBalance: jest.fn(),
}));

describe('Wallet', () => {
  beforeEach(() => {
    (useConnectWallet as jest.Mock).mockReturnValue([{ wallet: null }, mockConnect]);
    (useSetChain as jest.Mock).mockReturnValue([{}, mockSetChain]);
  });

  it('renders a "Connect Wallet" button', () => {
    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a wallet button', () => {
    (useConnectWallet as jest.Mock).mockImplementation(() => [
      { wallet: { accounts: [{ address: '0x123123123' }] } },
      () => {},
    ]);
    (useSelectedChain as jest.Mock).mockReturnValue('ethereum' as Chain);
    (useTokenBalance as jest.Mock).mockReturnValue({
      address: ZERO_ADDRESS,
      balance: new Decimal(10.456),
      chain: 'ethereum',
    });

    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('redirects after connect', async () => {
    const chain = 'ethereum';
    const redirectTo = `/pool/${chain}/ETH/lido`;
    const { getByRole } = subject({ redirectTo });

    const connectButton = getByRole('button');

    fireEvent.click(connectButton);

    expect(mockConnect).toBeCalledTimes(1);

    await waitFor(() => {
      expect(mockSetChain).toBeCalledTimes(1);
      expect(mockSetChain).toBeCalledWith({
        chainId: chainNameToHexChainId(chain),
      });

      expect(window.location.pathname).toBe(redirectTo);
    });
  });

  it('does not change chain if the redirect path is invalid', async () => {
    const redirectTo = '/pool/invalid/lido';
    const { getByRole } = subject({ redirectTo });

    const connectButton = getByRole('button');

    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockConnect).toBeCalledTimes(1);
      expect(mockSetChain).not.toBeCalled();
      expect(window.location.pathname).toBe(redirectTo);
    });
  });

  it('shows chain selector on chain switcher click and hides it after closing the modal', async () => {
    (useConnectWallet as jest.Mock).mockImplementation(() => [
      { wallet: { accounts: [{ address: '0x123123123' }] } },
      () => {},
    ]);
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: 'ethereum' }, mockSetChain]);

    const { container } = subject({});
    const chainSwitcherButton = container.querySelector('.tc__walletButton__connected-network');

    expect(chainSwitcherButton).not.toBeNull();

    if (chainSwitcherButton) {
      fireEvent.click(chainSwitcherButton);
    }

    const chainSelectorModal = container.querySelector('.tc__chainSelector');
    let closeModalButton = container.querySelector('.tc__chainSelector .tc__modal-header .tc__btn');

    expect(chainSelectorModal).not.toBeNull();
    expect(chainSelectorModal).toMatchSnapshot();

    expect(closeModalButton).not.toBeNull();

    if (closeModalButton) {
      fireEvent.click(closeModalButton);
    }

    closeModalButton = container.querySelector('.tc__chainSelector .tc__modal-header .tc__btn');

    expect(closeModalButton).toBeNull();
  });
});
