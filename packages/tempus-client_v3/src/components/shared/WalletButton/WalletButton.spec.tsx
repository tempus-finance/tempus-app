import { fireEvent, render } from '@testing-library/react';
import { chainToTicker, shortenAccount } from 'tempus-core-services';
import WalletButton, { WalletButtonProps } from './WalletButton';

jest.mock('react-blockies', () => () => (
  <canvas className="identicon" width="24" height="24" style={{ width: '24px', height: '24px' }} />
));

const mockOnConnect = jest.fn();
const mockOnNetworkClick = jest.fn();
const mockOnWalletClick = jest.fn();

const defaultProps: WalletButtonProps = {
  address: '',
  balance: '',
  chain: 'ethereum',
  onConnect: mockOnConnect,
  onNetworkClick: mockOnNetworkClick,
  onWalletClick: mockOnWalletClick,
};

const subject = (props: WalletButtonProps) => render(<WalletButton {...props} />);

describe('WalletButton', () => {
  it('renders a disconnected wallet button', () => {
    const { container, getByText } = subject(defaultProps);

    const actualWalletButton = container.querySelector('.tc__walletButton__disconnected');
    const actualText = getByText('Connect Wallet');

    expect(actualWalletButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualWalletButton).toMatchSnapshot();
  });

  it('calls `onConnect` when clicked on a disconnected wallet button', () => {
    const { queryByRole } = subject(defaultProps);

    const actualButton = queryByRole('button', { name: /Connect Wallet/ });
    expect(actualButton).not.toBeNull();

    fireEvent.click(actualButton as Element);
    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it('renders a connected wallet button', () => {
    const address = '0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5de';
    const { container, getByText } = subject({
      ...defaultProps,
      address,
      balance: '12.34',
    });

    const shortenedAccount = shortenAccount(address);

    const actualWalletButton = container.querySelector('.tc__walletButton__connected');
    const actualText = getByText(chainToTicker(defaultProps.chain));
    const actualBalance = getByText('12.34');
    const actualAddress = getByText(shortenedAccount);

    expect(actualWalletButton).not.toBeNull();
    expect(actualText).not.toBeNull();
    expect(actualBalance).not.toBeNull();
    expect(actualAddress).not.toBeNull();

    expect(actualWalletButton).toMatchSnapshot();
  });

  it('renders a connected wallet button to an unsupported network', () => {
    const address = '0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5de';
    const { container, getByText } = subject({
      ...defaultProps,
      address,
      balance: '77.99',
      chain: 'unsupported',
    });

    const actualWalletButton = container.querySelector('.tc__walletButton__connected');
    const actualText = getByText('Unsupported');

    expect(actualWalletButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualWalletButton).toMatchSnapshot();
  });
});
