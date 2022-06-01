import { act, fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal as MockDecimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { useWalletBalances } from '../../hooks';
import I18nProvider from '../../i18n/I18nProvider';
import { MaturityTerm, TokenMetadataProp } from '../../interfaces';
import DepositModal, { DepositModalProps } from './DepositModal';

const multipleTokens: TokenMetadataProp = [
  {
    precision: 18,
    precisionForUI: 4,
    rate: new MockDecimal(3500),
    ticker: 'ETH',
    address: '0x0',
  },
  {
    precision: 18,
    precisionForUI: 4,
    rate: new MockDecimal(3500),
    ticker: 'stETH',
    address: '0x1',
  },
];

const singleMaturityTerm: MaturityTerm[] = [
  {
    apr: new MockDecimal(0.074),
    date: new Date(2022, 9, 1),
  },
];

const multipleMaturityTerms: MaturityTerm[] = [
  ...singleMaturityTerm,
  {
    apr: new MockDecimal(0.131),
    date: new Date(2022, 11, 1),
  },
];

const defaultProps = {
  open: true,
  onClose: () => {},
  poolStartDate: new Date(2022, 3, 1),
  inputPrecision: 18,
};

const subject = (props: DepositModalProps) =>
  render(
    <BrowserRouter>
      <I18nProvider>
        <DepositModal {...props} />
      </I18nProvider>
    </BrowserRouter>,
  );

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useWalletBalances: jest.fn(),
}));

describe('DepositModal', () => {
  beforeAll(() => {
    (useWalletBalances as jest.Mock).mockImplementation(() => ({
      'ethereum-0x0': new MockDecimal(100),
      'ethereum-0x1': new MockDecimal(101),
    }));
  });

  const skipPreview = (container: HTMLElement) => {
    const previewButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    expect(previewButton).not.toBeNull();

    fireEvent.click(previewButton);
  };

  ['preview', 'input'].forEach(view => {
    const template = (terms: MaturityTerm[]) => {
      // load chain config
      const configManager = getConfigManager();
      configManager.init();

      const { container } = subject({
        ...defaultProps,
        tokens: multipleTokens,
        maturityTerms: terms,
        chainConfig: configManager.getChainConfig('ethereum'),
      });

      expect(container).not.toBeNull();

      if (view === 'input') {
        skipPreview(container);
      }

      expect(container).toMatchSnapshot();
    };

    it(`renders a deposit modal ${view} with one maturity term`, () => template(singleMaturityTerm));

    it(`renders a deposit modal ${view} with multiple maturity terms`, () => template(multipleMaturityTerms));
  });

  it('updates balance after currency change', () => {
    // load chain config
    const configManager = getConfigManager();
    configManager.init();

    const { container, getByRole } = subject({
      ...defaultProps,
      tokens: multipleTokens,
      maturityTerms: singleMaturityTerm,
      chainConfig: configManager.getChainConfig('ethereum'),
    });

    skipPreview(container);

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

    const currencyInput = container.querySelector('input');

    expect(currencyInput).not.toBeNull();
    expect(currencyInput).toHaveValue('101'); // TODO: Mock balance fetching
  });

  it('approves deposit and deposits on action button click', async () => {
    // load chain config
    const configManager = getConfigManager();
    configManager.init();

    jest.useFakeTimers();

    const { container } = subject({
      ...defaultProps,
      tokens: multipleTokens,
      maturityTerms: singleMaturityTerm,
      chainConfig: configManager.getChainConfig('ethereum'),
    });

    skipPreview(container);

    const actionButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    const currencyInput = container.querySelector('input');

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
