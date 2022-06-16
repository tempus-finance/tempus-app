import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Chain, chainNameToHexChainId, Decimal, ZERO_ADDRESS } from 'tempus-core-services';
import { useSelectedChain, useTokenBalance } from '../../hooks';
import Wallet, { WalletProps } from './Wallet';

const mockConnect = jest.fn();
const mockSetChain = jest.fn();
const mockSetSigner = jest.fn();

const noWallet = { wallet: null };
const connectedWallet = {
  wallet: {
    accounts: [{ address: '0x123123123' }],
    provider: {
      property: 'ABC',
    },
  },
};

const history = createMemoryHistory();

const subjectElement = (props: WalletProps) => (
  <Router location={history.location} navigator={history}>
    <Wallet {...props} />
  </Router>
);

const subject = (props: WalletProps) => render(subjectElement(props));

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

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn().mockImplementation(wallet => ({
        getSigner: jest.fn().mockImplementation(() => wallet),
      })),
    },
  },
}));

jest.mock('react-blockies', () => () => (
  <canvas className="identicon" width="24" height="24" style={{ width: '24px', height: '24px' }} />
));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useSelectedChain: jest.fn().mockReturnValue(['ethereum' as Chain, () => {}]),
  useTokenBalance: jest.fn(),
  useSigner: jest.fn().mockImplementation(() => [{}, mockSetSigner]),
}));

describe('Wallet', () => {
  beforeEach(() => {
    (useSetChain as jest.Mock).mockReturnValue([{}, mockSetChain]);

    history.push('/');
  });

  it('renders a "Connect Wallet" button', () => {
    (useConnectWallet as jest.Mock).mockReturnValue([noWallet, mockConnect]);
    (useSelectedChain as jest.Mock).mockReturnValue([null, () => false]);
    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a wallet button', () => {
    (useConnectWallet as jest.Mock).mockImplementation(() => [connectedWallet, () => {}]);
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum' as Chain, () => false]);
    (useTokenBalance as jest.Mock).mockReturnValue({
      address: ZERO_ADDRESS,
      balance: new Decimal(10.456),
      chain: 'ethereum',
    });

    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('stores the signer in the state after connecting', () => {
    (useConnectWallet as jest.Mock).mockImplementation(() => [connectedWallet, mockConnect]);

    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(mockSetSigner).toHaveBeenCalledWith({ property: 'ABC' });
  });

  it('redirects after connect', async () => {
    (useConnectWallet as jest.Mock)
      .mockReturnValue([connectedWallet, mockConnect])
      .mockReturnValueOnce([noWallet, mockConnect]);

    const chain = 'ethereum';
    const redirectTo = `/pool/${chain}/ETH/lido`;
    const { getByRole, rerender } = subject({ redirectTo });

    const connectButton = getByRole('button');

    mockConnect.mockImplementation(async () => {
      rerender(subjectElement({ redirectTo }));
    });

    act(() => {
      fireEvent.click(connectButton);
    });

    expect(mockConnect).toBeCalledTimes(1);

    await waitFor(() => {
      expect(mockSetChain).toBeCalledTimes(1);
      expect(mockSetChain).toBeCalledWith({
        chainId: chainNameToHexChainId(chain),
      });

      expect(history.location.pathname).toBe(redirectTo);
    });
  });

  it('does not change chain if the redirect path is invalid', async () => {
    (useConnectWallet as jest.Mock)
      .mockReturnValue([connectedWallet, mockConnect])
      .mockReturnValueOnce([noWallet, mockConnect]);

    const redirectTo = '/pool/invalid/lido';
    const { getByRole, rerender } = subject({ redirectTo });

    const connectButton = getByRole('button');

    mockConnect.mockImplementation(async () => {
      rerender(subjectElement({ redirectTo }));
    });

    act(() => {
      fireEvent.click(connectButton);
    });

    await waitFor(() => {
      expect(mockConnect).toBeCalledTimes(1);
      expect(mockSetChain).not.toBeCalled();
      expect(history.location.pathname).toBe(redirectTo);
    });
  });

  it('shows chain selector on chain switcher click and hides it after closing the modal', async () => {
    (useConnectWallet as jest.Mock).mockImplementation(() => [connectedWallet, () => {}]);
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
