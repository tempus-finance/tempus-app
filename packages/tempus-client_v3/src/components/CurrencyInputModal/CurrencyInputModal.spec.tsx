import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { MaturityTerm } from '../shared/TermTabs';
import CurrencyInputModal, { CurrencyInputModalProps } from './CurrencyInputModal';

const onTransactionStartMock = jest.fn<string, [Decimal]>();
const onAmountChangeMock = jest.fn<void, [Decimal]>();

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const singleMaturityTerm: MaturityTerm[] = [
  {
    apr: new Decimal(0.074),
    date: new Date(2022, 9, 1),
  },
];

const defaultProps: CurrencyInputModalProps = {
  title: '',
  description: '',
  open: true,
  onClose: () => {},
  balance: new Decimal(100),
  inputPrecision: 18,
  usdRates: singleCurrencyUsdRates,
  actionButtonLabels: { default: 'Action', loading: 'Loading', success: 'Success' },
  onTransactionStart: () => '0x0',
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

  it('enables action button click when appropriate amount is entered', () => {
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
    expect(actionButton).toHaveTextContent(defaultProps.actionButtonLabels.default);

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

    fireEvent.click(actionButton);

    expect(onTransactionStartMock).toBeCalledTimes(1);
    expect(onTransactionStartMock).toBeCalledWith(new Decimal('1.234'));

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
