import { act, fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal, Decimal as MockDecimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { useTokenBalances, setTempusPoolsForDepositModal } from '../../hooks';
import I18nProvider from '../../i18n/I18nProvider';
import { MaturityTerm, TokenMetadataProp } from '../../interfaces';
import DepositModal, { DepositModalProps } from './DepositModal';
import { TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS } from '../../constants';
import { pool2, pool4, pool2 as mockPool2 } from '../../mocks/config/mockConfig';

jest.mock('lottie-react', () => () => <div className="lottie-animation" />);
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('0x01'),
}));

const multipleTokens: TokenMetadataProp = [
  {
    precision: 18,
    precisionForUI: 4,
    rate: new Decimal(3500),
    ticker: 'ETH',
    address: '0x0',
  },
  {
    precision: 18,
    precisionForUI: 4,
    rate: new Decimal(3500),
    ticker: 'stETH',
    address: '0x1',
  },
];

const singleMaturityTerm: MaturityTerm[] = [
  {
    apr: new Decimal(0.074),
    date: new Date(pool2.maturityDate),
  },
];

const multipleMaturityTerms: MaturityTerm[] = [
  ...singleMaturityTerm,
  {
    apr: new Decimal(0.131),
    date: new Date(pool4.maturityDate),
  },
];

const defaultProps = {
  open: true,
  onClose: () => {},
  poolStartDate: new Date(Date.UTC(2022, 3, 1)),
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

const mockSetSigner = jest.fn();
const mockApproveToken = jest.fn();

const mockApproveTokenStatusPending = {
  pending: true,
  txnId: '0x01',
};

const mockApproveTokenStatusDone = {
  pending: false,
  success: true,
  contractTransaction: {
    hash: '0x123',
  },
  request: {
    chain: 'ethereum',
    tokenAddress: '0x001',
    amount: new Decimal('9'),
  },
  txnId: '0x01',
};

let mockApproveStatus: any = {};

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
  useTokenBalances: jest.fn(),
  useSigner: jest.fn().mockImplementation(() => [{ signerProperty: 'xyz' }, mockSetSigner]),
  useDepositModalData: jest.fn().mockImplementation(() => () => ({ tempusPools: [mockPool2] })),
  useTokenApprove: () => ({
    approveToken: mockApproveToken,
    approveTokenStatus: mockApproveStatus,
  }),
}));

describe('DepositModal', () => {
  beforeEach(() => {
    (useTokenBalances as jest.Mock).mockImplementation(() => ({
      'ethereum-0x0': new MockDecimal(100),
      'ethereum-0x1': new MockDecimal(101),
    }));
  });

  const skipPreview = (container: HTMLElement) => {
    const previewButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    expect(previewButton).not.toBeNull();

    fireEvent.click(previewButton as Element);
  };

  const changeApprovalStatus = (status: any) => {
    mockApproveStatus = status;
  };

  ['preview', 'input'].forEach(view => {
    const template = (terms: MaturityTerm[]) => {
      const configManager = getConfigManager();

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
    const configManager = getConfigManager();

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
    fireEvent.click(currencyDropdownButton as Element);

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

  it('enables approve button on amount change', async () => {
    const configManager = getConfigManager();

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

    fireEvent.change(currencyInput as HTMLInputElement, { target: { value: '1' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(actionButton).toBeEnabled();

    jest.useRealTimers();
  });

  it('disables the `Approve` button once clicked upon and enables it again on success', async () => {
    const configManager = getConfigManager();
    mockApproveToken.mockImplementation(() => changeApprovalStatus(mockApproveTokenStatusPending));

    const props = {
      ...defaultProps,
      tokens: multipleTokens,
      maturityTerms: singleMaturityTerm,
      chainConfig: configManager.getChainConfig('ethereum'),
    };

    jest.useFakeTimers();

    const wrapper = subject(props);
    const { container } = wrapper;

    skipPreview(container);

    const actionButton = container.querySelector('.tc__currency-input-modal__action-container .tc__actionButton');
    const currencyInput = container.querySelector('input');

    expect(actionButton).not.toBeNull();
    expect(actionButton).toBeDisabled();

    expect(currencyInput).not.toBeNull();

    fireEvent.change(currencyInput as HTMLInputElement, { target: { value: '1' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(actionButton).toBeEnabled();

    // click on approve

    await act(async () => {
      await fireEvent.click(actionButton as Element);
      jest.advanceTimersByTime(300);
    });

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-loading');

    changeApprovalStatus(mockApproveTokenStatusDone);

    act(() => {
      wrapper.rerender(
        <BrowserRouter>
          <I18nProvider>
            <DepositModal {...props} />
          </I18nProvider>
        </BrowserRouter>,
      );
    });

    await expect(actionButton).toBeDisabled();
    await expect(actionButton).toHaveClass('tc__actionButton-border-primary-large-success');

    act(() => {
      jest.advanceTimersByTime(TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    });

    await act(async () => {
      await expect(actionButton).toBeEnabled();
      await expect(actionButton).toHaveClass('tc__actionButton-border-primary-large');
    });

    jest.useRealTimers();
  });
});
