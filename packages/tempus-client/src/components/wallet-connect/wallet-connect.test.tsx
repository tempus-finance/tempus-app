import { fireEvent, render } from '@testing-library/react';
import WalletConnect, { CONNECT_WALLET } from './wallet-connect';

jest.mock('@web3-react/core');
const { useWeb3React } = require('@web3-react/core');

describe('WalletConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows default message when wallet not connected', () => {
    useWeb3React.mockImplementation(() => ({
      account: undefined,
      activate: jest.fn,
      active: false,
    }));

    const { getByText } = render(<WalletConnect />);

    expect(getByText(CONNECT_WALLET)).toBeInTheDocument();
  });

  xtest(`calls "activate" method when click on "${CONNECT_WALLET}"`, () => {
    const mockActivate = jest.fn();

    useWeb3React.mockImplementation(() => ({
      account: undefined,
      activate: mockActivate,
      active: false,
    }));

    const { getByText } = render(<WalletConnect />);

    fireEvent.click(getByText(CONNECT_WALLET));

    expect(mockActivate).toHaveBeenCalledTimes(1);
  });

  xtest('shows user address when wallet is connected', () => {
    useWeb3React.mockImplementation(() => ({
      account: 'ABC-123-XYZ',
      activate: jest.fn,
      active: true,
    }));

    const { getByText } = render(<WalletConnect />);

    expect(getByText(/ABC-12...3-XYZ/i)).toBeInTheDocument();
  });
});
