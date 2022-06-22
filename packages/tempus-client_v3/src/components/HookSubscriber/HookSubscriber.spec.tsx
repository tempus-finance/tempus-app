import { render } from '@testing-library/react';
import { HookSubscriber } from './HookSubscriber';
import {
  useLocale,
  useSelectedChain,
  useUserPreferences,
  useServicesLoaded,
  useWalletAddress,
  usePoolViewOptions,
  useSigner,
  subscribeFixedAprs,
  subscribeTakenRates,
  subscribeTvlData,
  subscribeAllowance,
  subscribeApproveTokenStatus,
  subscribeFixedDepositStatus,
  subscribeWithdrawStatus,
} from '../../hooks';

const subject = () => render(<HookSubscriber />);

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useLocale: jest.fn(),
  useSelectedChain: jest.fn(),
  useUserPreferences: jest.fn(),
  useServicesLoaded: jest.fn(),
  useWalletAddress: jest.fn(),
  usePoolViewOptions: jest.fn(),
  useSigner: jest.fn(),
  subscribeFixedAprs: jest.fn(),
  subscribeTakenRates: jest.fn(),
  subscribeTvlData: jest.fn(),
  subscribeAllowance: jest.fn(),
  subscribeApproveTokenStatus: jest.fn(),
  subscribeFixedDepositStatus: jest.fn(),
  subscribeWithdrawStatus: jest.fn(),
}));

describe('HookSubscriber', () => {
  it('renders a empty component that subscribe all the state hooks', () => {
    const mockUseLocale = jest.fn();
    const mockUseSelectedChain = jest.fn();
    const mockUseUserPreferences = jest.fn();
    const mockUseServicesLoaded = jest.fn();
    const mockUseWalletAddress = jest.fn();
    const mockUsePoolViewOptions = jest.fn();
    const mockUseSigner = jest.fn();
    const mockSubscribeFixedAprs = jest.fn();
    const mockSubscribeTakenRates = jest.fn();
    const mockSubscribeTvlData = jest.fn();
    const mockSubscribeAllowance = jest.fn();
    const mockSubscribeApproveTokenStatus = jest.fn();
    const mockSubscribeFixedDepositStatus = jest.fn();
    const mockSubscribeWithdrawStatus = jest.fn();

    (useLocale as jest.Mock).mockImplementation(mockUseLocale);
    (useSelectedChain as jest.Mock).mockImplementation(mockUseSelectedChain);
    (useUserPreferences as jest.Mock).mockImplementation(mockUseUserPreferences);
    (useServicesLoaded as jest.Mock).mockImplementation(mockUseServicesLoaded);
    (useWalletAddress as jest.Mock).mockImplementation(mockUseWalletAddress);
    (usePoolViewOptions as jest.Mock).mockImplementation(mockUsePoolViewOptions);
    (useSigner as jest.Mock).mockImplementation(mockUseSigner);
    (subscribeFixedAprs as jest.Mock).mockImplementation(mockSubscribeFixedAprs);
    (subscribeTakenRates as jest.Mock).mockImplementation(mockSubscribeTakenRates);
    (subscribeTvlData as jest.Mock).mockImplementation(mockSubscribeTvlData);
    (subscribeAllowance as jest.Mock).mockImplementation(mockSubscribeAllowance);
    (subscribeApproveTokenStatus as jest.Mock).mockImplementation(mockSubscribeApproveTokenStatus);
    (subscribeFixedDepositStatus as jest.Mock).mockImplementation(mockSubscribeFixedDepositStatus);
    (subscribeWithdrawStatus as jest.Mock).mockImplementation(mockSubscribeWithdrawStatus);

    const { container } = subject();

    expect(container.firstChild).toBeNull();

    expect(mockUseLocale).toHaveBeenCalled();
    expect(mockUseSelectedChain).toHaveBeenCalled();
    expect(mockUseUserPreferences).toHaveBeenCalled();
    expect(mockUseServicesLoaded).toHaveBeenCalled();
    expect(mockUseWalletAddress).toHaveBeenCalled();
    expect(mockUsePoolViewOptions).toHaveBeenCalled();
    expect(mockUseSigner).toHaveBeenCalled();
    expect(mockSubscribeFixedAprs).toHaveBeenCalled();
    expect(mockSubscribeTakenRates).toHaveBeenCalled();
    expect(mockSubscribeTvlData).toHaveBeenCalled();
    expect(mockSubscribeAllowance).toHaveBeenCalled();
    expect(mockSubscribeApproveTokenStatus).toHaveBeenCalled();
    expect(mockSubscribeFixedDepositStatus).toHaveBeenCalled();
    expect(mockSubscribeWithdrawStatus).toHaveBeenCalled();
  });
});
