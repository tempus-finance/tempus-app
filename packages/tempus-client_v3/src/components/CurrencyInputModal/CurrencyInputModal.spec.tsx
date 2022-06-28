import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, Decimal as MockDecimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { MaturityTerm } from '../../interfaces';
import { pool1, pool1 as mockPool1 } from '../../setupTests';
import CurrencyInputModal, { CurrencyInputModalProps } from './CurrencyInputModal';

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

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useFees: jest.fn().mockReturnValue({
    [`${mockPool1.chain}-${mockPool1.address}`]: {
      deposit: new MockDecimal(0.01),
      redemption: new MockDecimal(0.02),
      earlyRedemption: new MockDecimal(0.03),
      swap: new MockDecimal(0.04),
    },
  }),
}));

const onTransactionStartMock = jest.fn<Promise<string>, [Decimal]>().mockResolvedValue('someResult');
const onAmountChangeMock = jest.fn<void, [Decimal]>();

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const singleMaturityTerm: MaturityTerm[] = [
  {
    apr: new Decimal(0.074),
    date: new Date(Date.UTC(2022, 9, 1)),
  },
];

const defaultProps: CurrencyInputModalProps = {
  selectedPool: pool1,
  title: '',
  description: '',
  open: true,
  onClose: () => {},
  balance: new Decimal(100),
  tokens: [
    {
      precision: 18,
      rate: new Decimal(3500),
      ticker: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      precisionForUI: 2,
    },
  ],
  actionButtonLabels: { action: { default: 'Action', loading: 'Loading', success: 'Success' } },
  onTransactionStart: () => Promise.resolve('someString'),
};

const subject = (props: CurrencyInputModalProps) => render(<CurrencyInputModal {...props} />);

describe('CurrencyInputModal', () => {
  beforeEach(async () => {
    const configManager = getConfigManager();
    await configManager.init();

    defaultProps.chainConfig = configManager.getChainConfig('ethereum');
  });

  it('renders a modal with currency input', () => {
    const { container } = subject({
      ...defaultProps,
      maturityTerms: singleMaturityTerm,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('enables action button click when appropriate amount is entered', async () => {
    jest.useFakeTimers();

    const { container, getByRole } = subject({
      ...defaultProps,
      maturityTerms: singleMaturityTerm,
      onTransactionStart: onTransactionStartMock,
      onAmountChange: onAmountChangeMock,
    });

    const actionButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    const currencyInput = getByRole('textbox');

    expect(actionButton).not.toBeNull();
    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveTextContent(defaultProps.actionButtonLabels.action.default);

    expect(currencyInput).not.toBeNull();

    fireEvent.change(currencyInput, { target: { value: '100.234' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onAmountChangeMock).toBeCalledTimes(1);
    expect(onAmountChangeMock).toBeCalledWith(new Decimal('100.234'));

    expect(actionButton).toBeDisabled();

    fireEvent.change(currencyInput, { target: { value: '1.234' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onAmountChangeMock).toBeCalledTimes(2);
    expect(onAmountChangeMock).toBeCalledWith(new Decimal('1.234'));

    expect(actionButton).toBeEnabled();

    fireEvent.click(actionButton as Element);

    await act(async () => {
      await expect(onTransactionStartMock).toBeCalledTimes(1);
      await expect(onTransactionStartMock).toBeCalledWith(new Decimal('1.234'));
    });

    expect(actionButton).toMatchSnapshot();
    expect(currencyInput).toMatchSnapshot();

    fireEvent.change(currencyInput, { target: { value: '' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onAmountChangeMock).toBeCalledTimes(3);
    expect(onAmountChangeMock).toBeCalledWith(new Decimal(0));

    jest.useRealTimers();
  });
});
