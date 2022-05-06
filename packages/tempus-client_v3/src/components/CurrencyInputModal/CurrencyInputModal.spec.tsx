import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, Ticker } from 'tempus-core-services';
import { MaturityTerm } from '../shared/TermTabs';
import CurrencyInputModal, { CurrencyInputModalProps } from './CurrencyInputModal';

const onActionButtonClickMock = jest.fn<string, [Decimal]>();
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
  balance: new Decimal(100),
  inputPrecision: 18,
  actionButtonLabels: { default: 'Action', loading: 'Loading', success: 'Success' },
  chainConfig: { blockExplorerName: 'Etherscan', blockExplorerUrl: 'https://etherscan.io/' },
};

const subject = (props: CurrencyInputModalProps) => render(<CurrencyInputModal {...props} />);

describe('CurrencyInputModal', () => {
  it('renders a modal with currency input', () => {
    const { container } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
      maturityTerms: singleMaturityTerm,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('enables action button click when appropriate amount is entered', () => {
    jest.useFakeTimers();

    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
      maturityTerms: singleMaturityTerm,
      onActionButtonClick: onActionButtonClickMock,
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

    expect(onActionButtonClickMock).toBeCalledTimes(1);
    expect(onActionButtonClickMock).toBeCalledWith(new Decimal('1.234'));

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
