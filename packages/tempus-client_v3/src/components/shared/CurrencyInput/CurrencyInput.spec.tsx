import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, DecimalUtils, Ticker } from 'tempus-core-services';
import { TokenMetadataProp } from '../../../interfaces';
import CurrencyInput, { CurrencyInputProps } from './CurrencyInput';

const defaultProps: CurrencyInputProps = {
  tokens: [
    {
      precision: 18,
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
  ],
  maxAmount: new Decimal(100),
};

const mockOnAmountUpdate = jest.fn<void, [string]>();
const mockOnCurrencyUpdate = jest.fn<void, [Ticker]>();

const singleToken: TokenMetadataProp = [
  {
    precision: 18,
    rate: new Decimal(3500),
    ticker: 'ETH',
  },
];

const multipleTokens: TokenMetadataProp = [
  {
    precision: 18,
    rate: new Decimal(3500),
    ticker: 'ETH',
  },
  {
    precision: 18,
    rate: new Decimal(3500),
    ticker: 'stETH',
  },
];

const subject = (props: CurrencyInputProps) => render(<CurrencyInput {...props} />);

describe('CurrencyInput', () => {
  beforeEach(jest.useFakeTimers);
  afterEach(jest.useRealTimers);

  it('renders a currency input with a single currency', () => {
    const { getAllByRole, getByRole, queryByText } = subject({
      ...defaultProps,
      tokens: singleToken,
    });

    const actualButton = getByRole('button', { name: 'ETH' });
    const actualText = queryByText('ETH');
    const actualPercentageNumbers = getAllByRole('button', { name: /[\d%\s]+/ });

    expect(actualButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualPercentageNumbers).not.toBeNull();
    expect(actualPercentageNumbers).toHaveLength(4);

    expect(actualButton).toMatchSnapshot();
    expect(actualText).toMatchSnapshot();
    expect(actualPercentageNumbers).toMatchSnapshot();
  });

  it('renders a disabled currency input with a single currency', () => {
    const { getByRole } = subject({
      ...defaultProps,
      tokens: singleToken,
      disabled: true,
    });

    const actualButton = getByRole('button', { name: 'ETH' });

    expect(actualButton).not.toBeNull();
    expect(actualButton).toBeDisabled();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a currency input with a single currency and an error', () => {
    const { container } = subject({
      ...defaultProps,
      tokens: singleToken,
      error: 'Input error',
    });

    const actualError = container.querySelector('.tc__currency-input__error');

    expect(actualError).not.toBeNull();
    expect(actualError).toHaveTextContent('Input error');

    expect(actualError).toMatchSnapshot();
  });

  it('renders a currency input with multiple currencies', () => {
    const { getAllByRole, getByRole, queryByText } = subject({
      ...defaultProps,
      tokens: multipleTokens,
    });

    const actualButton = getByRole('button', { name: 'ETH' });
    const actualTexts = queryByText('ETH');
    const actualPercentageNumbers = getAllByRole('button', { name: /[\d%\s]+/ });

    expect(actualButton).not.toBeNull();
    expect(actualTexts).not.toBeNull();

    expect(actualPercentageNumbers).not.toBeNull();
    expect(actualPercentageNumbers).toHaveLength(4);

    expect(actualButton).toMatchSnapshot();
    expect(actualTexts).toMatchSnapshot();
    expect(actualPercentageNumbers).toMatchSnapshot();
  });

  it('resets the input field when currency is changed', () => {
    const { getByRole } = subject({
      ...defaultProps,
      tokens: multipleTokens,
      onAmountUpdate: mockOnAmountUpdate,
      onCurrencyUpdate: mockOnCurrencyUpdate,
    });

    const actualSelectorButton = getByRole('button', { name: 'ETH' });
    const actualInput = getByRole('textbox');

    expect(actualSelectorButton).not.toBeNull();

    expect(actualInput).not.toBeNull();
    expect(actualInput).not.toHaveValue();

    fireEvent.change(actualInput, { target: { value: '123' } });
    fireEvent.click(actualSelectorButton);

    expect(actualInput).toHaveValue('123');

    expect(mockOnAmountUpdate).not.toBeCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnAmountUpdate).toBeCalledTimes(1);
    expect(mockOnAmountUpdate).toBeCalledWith('123');

    const actualStEthButton = getByRole('button', { name: 'stETH' });

    fireEvent.click(actualStEthButton);

    expect(actualInput).not.toHaveValue();
    expect(actualInput).toMatchSnapshot();

    expect(mockOnAmountUpdate).toBeCalledTimes(2);
    expect(mockOnAmountUpdate).toBeCalledWith('');

    expect(mockOnCurrencyUpdate).toBeCalledTimes(1);
    expect(mockOnCurrencyUpdate).toBeCalledWith('stETH');
  });

  it('updates the input field when a percentage button is clicked', () => {
    const { container, getAllByRole, getByRole } = subject({
      ...defaultProps,
      tokens: multipleTokens,
      onAmountUpdate: mockOnAmountUpdate,
    });

    const percentageButtons = getAllByRole('button', { name: /[\d\s%]+/ });
    const inputField = getByRole('textbox');

    expect(inputField).not.toBeNull();
    expect(inputField).not.toHaveValue();

    percentageButtons.forEach((button, index) => {
      const valueInCurrency = new Decimal(25 * (index + 1)).mul(defaultProps.maxAmount).div(100);
      const valueInFiat = new Decimal(valueInCurrency).mul(singleToken[0].rate);

      fireEvent.click(button);

      const formattedValueInCurrency = valueInCurrency.toString();
      const fiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');

      expect(button).toMatchSnapshot();

      expect(inputField).toHaveValue(formattedValueInCurrency);
      expect(inputField).toMatchSnapshot();

      expect(mockOnAmountUpdate).toBeCalledTimes(index + 1);
      expect(mockOnAmountUpdate).toBeCalledWith(formattedValueInCurrency);

      expect(fiatValue).not.toBeNull();
      expect(fiatValue).toHaveTextContent(DecimalUtils.formatToCurrency(valueInFiat, 2, '$'));
      expect(fiatValue).toMatchSnapshot();
    });
  });

  it('updates the USD value based on same-precision USD rate', () => {
    const inputValue = 123;
    const precision = 18;

    const usdRates = new Map<Ticker, Decimal>();
    usdRates.set('ETH', new Decimal(3500));

    const { container, getByRole } = subject({
      tokens: [
        {
          precision,
          rate: new Decimal(3500),
          ticker: 'ETH',
        },
      ],
      maxAmount: new Decimal(100),
    });

    const actualInput = getByRole('textbox');

    expect(actualInput).not.toBeNull();

    fireEvent.change(actualInput, { target: { value: `${inputValue}` } });

    const fiatValue = new Decimal(inputValue).mul(usdRates.get('ETH') ?? 0);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const actualFiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');

    expect(actualFiatValue).not.toBeNull();
    expect(actualFiatValue).toHaveTextContent(DecimalUtils.formatToCurrency(fiatValue, 2, '$'));
    expect(actualFiatValue).toMatchSnapshot();
  });

  it('updates the USD value based on less precise USD rate', () => {
    const inputValue = 123;

    const { container, getByRole } = subject({
      ...defaultProps,
      tokens: singleToken,
    });

    const actualInput = getByRole('textbox');
    let actualLoading = container.querySelector('.tc__loading');

    expect(actualInput).not.toBeNull();
    expect(actualLoading).toBeNull();

    fireEvent.change(actualInput, { target: { value: `${inputValue}` } });

    actualLoading = container.querySelector('.tc__loading');

    expect(actualLoading).not.toBeNull();

    const fiatValue = new Decimal(inputValue).mul(singleToken[0].rate);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const actualFiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');
    actualLoading = container.querySelector('.tc__loading');

    expect(actualLoading).toBeNull();

    expect(actualFiatValue).not.toBeNull();
    expect(actualFiatValue).toHaveTextContent(DecimalUtils.formatToCurrency(fiatValue, 2, '$'));
    expect(actualFiatValue).toMatchSnapshot();
  });
});
