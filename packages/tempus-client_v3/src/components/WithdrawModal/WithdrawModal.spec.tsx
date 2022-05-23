import { act, fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import WithdrawModal, { WithdrawModalProps } from './WithdrawModal';

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const multipleCurrencyUsdRates = new Map<Ticker, Decimal>();
multipleCurrencyUsdRates.set('ETH', new Decimal(3500));
multipleCurrencyUsdRates.set('stETH', new Decimal(3500));

const defaultProps: WithdrawModalProps = {
  open: true,
  inputPrecision: 18,
};

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
      usdRates: singleCurrencyUsdRates,
    });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates balance after currency change', () => {
    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: multipleCurrencyUsdRates,
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

  it('withdraws on action button click', async () => {
    // load chain config
    const configManager = getConfigManager();
    const successfulConfigInit = await configManager.init();

    expect(successfulConfigInit).toBeTruthy();

    jest.useFakeTimers();

    const { container, getByRole } = subject({
      ...defaultProps,
      usdRates: singleCurrencyUsdRates,
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
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large');

    // withdraw
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
