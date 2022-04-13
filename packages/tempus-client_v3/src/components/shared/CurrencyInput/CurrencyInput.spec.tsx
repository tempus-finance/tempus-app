import { act, fireEvent, render } from '@testing-library/react';
import { BigNumber, ethers } from 'ethers';
import { div18f, increasePrecision, mul18f, NumberUtils, Ticker } from 'tempus-core-services';
import CurrencyInput, { CurrencyInputProps } from './CurrencyInput';

const defaultProps = {
  precision: 18,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
  ratePrecision: 2,
};

const mockOnAmountUpdate = jest.fn<void, [string]>();
const mockOnCurrencyUpdate = jest.fn<void, [Ticker]>();

const singleCurrencyUsdRates = new Map<Ticker, BigNumber>();
singleCurrencyUsdRates.set('ETH', increasePrecision(BigNumber.from(3500), defaultProps.ratePrecision));

const multipleCurrencyUsdRates = new Map<Ticker, BigNumber>();
multipleCurrencyUsdRates.set('ETH', increasePrecision(BigNumber.from(3500), defaultProps.ratePrecision));
multipleCurrencyUsdRates.set('stETH', increasePrecision(BigNumber.from(3500), defaultProps.ratePrecision));

const subject = (props: CurrencyInputProps) => render(<CurrencyInput {...props} />);

describe('CurrencyInput', () => {
  beforeEach(jest.useFakeTimers);
  afterEach(jest.useRealTimers);

  it('renders a currency input with a single currency', () => {
    const { getAllByRole, getByRole, queryByText } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
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
      usdRates: singleCurrencyUsdRates,
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
      usdRates: singleCurrencyUsdRates,
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
      usdRates: multipleCurrencyUsdRates,
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
      usdRates: multipleCurrencyUsdRates,
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
      usdRates: singleCurrencyUsdRates,
      onAmountUpdate: mockOnAmountUpdate,
    });

    const percentageButtons = getAllByRole('button', { name: /[\d\s%]+/ });
    const inputField = getByRole('textbox');

    expect(inputField).not.toBeNull();
    expect(inputField).not.toHaveValue();

    percentageButtons.forEach((button, index) => {
      const valueInCurrency = div18f(
        mul18f(BigNumber.from(25 * (index + 1)), defaultProps.maxAmount, defaultProps.precision),
        BigNumber.from(100),
        defaultProps.precision,
      );
      const valueInFiat = mul18f(
        valueInCurrency,
        increasePrecision(
          singleCurrencyUsdRates.get('ETH') ?? BigNumber.from(0),
          defaultProps.precision - defaultProps.ratePrecision,
        ),
        defaultProps.precision,
      );

      fireEvent.click(button);

      const formattedValueInCurrency = ethers.utils.formatUnits(valueInCurrency, defaultProps.precision);
      const fiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');

      expect(button).toMatchSnapshot();

      expect(inputField).toHaveValue(formattedValueInCurrency);
      expect(inputField).toMatchSnapshot();

      expect(mockOnAmountUpdate).toBeCalledTimes(index + 1);
      expect(mockOnAmountUpdate).toBeCalledWith(formattedValueInCurrency);

      expect(fiatValue).not.toBeNull();
      expect(fiatValue).toHaveTextContent(
        NumberUtils.formatToCurrency(ethers.utils.formatUnits(valueInFiat, defaultProps.precision), 2, '$'),
      );
      expect(fiatValue).toMatchSnapshot();
    });
  });

  it('updates the USD value based on same-precision USD rate', () => {
    const inputValue = 123;
    const precision = 18;

    const usdRates = new Map<Ticker, BigNumber>();
    usdRates.set('ETH', increasePrecision(BigNumber.from(3500), precision));

    const { container, getByRole } = subject({
      precision,
      usdRates,
      maxAmount: increasePrecision(BigNumber.from(100), precision),
      ratePrecision: precision,
    });

    const actualInput = getByRole('textbox');

    expect(actualInput).not.toBeNull();

    fireEvent.change(actualInput, { target: { value: `${inputValue}` } });

    const fiatValue = mul18f(
      increasePrecision(BigNumber.from(inputValue), precision),
      usdRates.get('ETH') ?? BigNumber.from(0),
      precision,
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const actualFiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');

    expect(actualFiatValue).not.toBeNull();
    expect(actualFiatValue).toHaveTextContent(
      NumberUtils.formatToCurrency(ethers.utils.formatUnits(fiatValue, defaultProps.precision), 2, '$'),
    );
    expect(actualFiatValue).toMatchSnapshot();
  });

  it('updates the USD value based on less precise USD rate', () => {
    const inputValue = 123;

    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
    });

    const actualInput = getByRole('textbox');
    let actualLoading = container.querySelector('.tc__loading');

    expect(actualInput).not.toBeNull();
    expect(actualLoading).toBeNull();

    fireEvent.change(actualInput, { target: { value: `${inputValue}` } });

    actualLoading = container.querySelector('.tc__loading');

    expect(actualLoading).not.toBeNull();

    const fiatValue = mul18f(
      increasePrecision(BigNumber.from(inputValue), defaultProps.precision),
      increasePrecision(
        singleCurrencyUsdRates.get('ETH') ?? BigNumber.from(0),
        defaultProps.precision - defaultProps.ratePrecision,
      ),
      defaultProps.precision,
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const actualFiatValue = container.querySelector('.tc__currency-input__fiat-amount > div');
    actualLoading = container.querySelector('.tc__loading');

    expect(actualLoading).toBeNull();

    expect(actualFiatValue).not.toBeNull();
    expect(actualFiatValue).toHaveTextContent(
      NumberUtils.formatToCurrency(ethers.utils.formatUnits(fiatValue, defaultProps.precision), 2, '$'),
    );
    expect(actualFiatValue).toMatchSnapshot();
  });
});