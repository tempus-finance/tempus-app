import { act, fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { TokenMetadataProp } from '../../interfaces';
import { mockConfig } from '../../setupTests';
import { pool1 } from '../../mocks/config/mockConfig';
import { WithdrawModal, WithdrawModalProps } from './WithdrawModal';

jest.mock('lottie-react', () => () => <div className="lottie-animation" />);

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
  useConnectWallet: jest.fn().mockReturnValue([{ wallet: { accounts: [{ address: '0x123123123' }] } }, () => {}]),
  useSetChain: jest.fn().mockReturnValue([{}, () => {}]),
  useWallets: jest.fn().mockReturnValue([]),
}));

const defaultProps: WithdrawModalProps = {
  open: true,
  onClose: () => {},
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '0x0',
      rate: new Decimal(3500),
      ticker: 'ETH',
      balance: new Decimal(100),
    },
  ],
  chainConfig: mockConfig.ethereum,
  tempusPool: pool1,
};

const singleToken: TokenMetadataProp = [
  {
    precision: 18,
    precisionForUI: 4,
    address: '0x0',
    rate: new Decimal(1),
    ticker: 'ETH',
    balance: new Decimal(100),
  },
];

const multipleTokens: TokenMetadataProp = [
  {
    precision: 18,
    precisionForUI: 4,
    address: '0x0',
    rate: new Decimal(1),
    ticker: 'ETH',
    balance: new Decimal(100),
  },
  {
    precision: 18,
    precisionForUI: 4,
    address: '0x1',
    rate: new Decimal(1),
    ticker: 'stETH',
    balance: new Decimal(200),
  },
];

const subject = (props: WithdrawModalProps) =>
  render(
    <BrowserRouter>
      <WithdrawModal {...props} />
    </BrowserRouter>,
  );

describe('WithdrawModal', () => {
  it('renders a withdraw modal', () => {
    const { container } = subject({
      ...defaultProps,
      tokens: singleToken,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates balance after currency change', () => {
    const { container, getByRole } = subject({
      ...defaultProps,
      tokens: multipleTokens,
    });

    const currencyDropdownButton = container.querySelector('.tc__currency-input__currency-selector > button');

    expect(currencyDropdownButton).not.toBeNull();

    // open currency dropdown
    fireEvent.click(currencyDropdownButton as Element);

    const currencyButtons = container.querySelectorAll('.tc__currency-input__currency-selector-dropdown button');

    expect(currencyButtons).not.toBeNull();
    expect(currencyButtons).toHaveLength(2);

    fireEvent.click(currencyButtons[1]);

    const allBalanceButton = getByRole('button', { name: '100%' });

    expect(allBalanceButton).not.toBeNull();

    fireEvent.click(allBalanceButton);

    const currencyInput = getByRole('textbox');

    expect(currencyInput).not.toBeNull();
    expect(currencyInput).toHaveValue('200');
  });

  it('withdraws on action button click', async () => {
    // load chain config
    const configManager = getConfigManager();
    configManager.init();

    jest.useFakeTimers();

    const { container, getByRole } = subject({
      ...defaultProps,
      tokens: singleToken,
      chainConfig: configManager.getChainConfig('ethereum'),
    });

    const actionButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    const currencyInput = getByRole('textbox');

    expect(actionButton).not.toBeNull();
    expect(actionButton).toBeDisabled();

    expect(currencyInput).not.toBeNull();

    fireEvent.change(currencyInput, { target: { value: '1' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(actionButton).toBeEnabled();

    // withdraw
    fireEvent.click(actionButton as Element);

    await act(async () => {
      await expect(actionButton).toBeDisabled();
    });

    // wait for transaction to finish
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(actionButton).toBeDisabled();

    jest.useRealTimers();
  });
});
