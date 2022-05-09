import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { MaturityTerm } from '../shared/TermTabs';
import DepositModal, { DepositModalProps } from './DepositModal';

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const multipleCurrencyUsdRates = new Map<Ticker, Decimal>();
multipleCurrencyUsdRates.set('ETH', new Decimal(3500));
multipleCurrencyUsdRates.set('stETH', new Decimal(3500));

const singleMaturityTerm: MaturityTerm[] = [
  {
    apr: new Decimal(0.074),
    date: new Date(2022, 9, 1),
  },
];

const multipleMaturityTerms: MaturityTerm[] = [
  ...singleMaturityTerm,
  {
    apr: new Decimal(0.131),
    date: new Date(2022, 11, 1),
  },
];

const defaultProps: DepositModalProps = {
  open: true,
  inputPrecision: 18,
};

const subject = (props: DepositModalProps) => render(<DepositModal {...props} />);

describe('DepositModal', () => {
  it('renders a deposit modal with one maturity term', () => {
    const { container } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
      maturityTerms: singleMaturityTerm,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a deposit modal with multiple maturity terms', () => {
    const { container } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
      maturityTerms: multipleMaturityTerms,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates balance after currency change', () => {
    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: multipleCurrencyUsdRates,
      maturityTerms: singleMaturityTerm,
    });

    const currencyDropdownButton = container.querySelector('.tc__currency-input__currency-selector > button');

    expect(currencyDropdownButton).not.toBeNull();

    // open currency dropdown
    fireEvent.click(currencyDropdownButton);

    const currencyButtons = container.querySelectorAll('.tc__currency-input__currency-selector-dropdown button');

    expect(currencyButtons).not.toBeNull();
    expect(currencyButtons).toHaveLength(2);

    fireEvent.click(currencyButtons[1]);

    const allBalanceButton = getByRole('button', { name: '100%' });

    expect(allBalanceButton).not.toBeNull();

    fireEvent.click(allBalanceButton);

    const currencyInput = getByRole('textbox');

    expect(currencyInput).not.toBeNull();
    expect(currencyInput).toHaveValue('101'); // TODO: Mock balance fetching
  });

  it('approves deposit and deposits on action button click', async () => {
    // load chain config
    const configManager = getConfigManager();
    const successfulConfigInit = await configManager.init();

    expect(successfulConfigInit).toBeTruthy();

    jest.useFakeTimers();

    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
      maturityTerms: singleMaturityTerm,
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

    // approve deposit
    fireEvent.click(actionButton);

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-loading');

    // wait for transaction to finish
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-success');

    // wait for button switch from approve deposit to deposit
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(actionButton).toBeEnabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large');

    // deposit
    fireEvent.click(actionButton);

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-loading');

    // wait for transaction to finish
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-success');

    jest.useRealTimers();
  });
});
