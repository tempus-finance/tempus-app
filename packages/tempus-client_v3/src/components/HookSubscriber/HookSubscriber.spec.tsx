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

    (useLocale as jest.Mock).mockImplementation(mockUseLocale);
    (useSelectedChain as jest.Mock).mockImplementation(mockUseSelectedChain);
    (useUserPreferences as jest.Mock).mockImplementation(mockUseUserPreferences);
    (useServicesLoaded as jest.Mock).mockImplementation(mockUseServicesLoaded);
    (useWalletAddress as jest.Mock).mockImplementation(mockUseWalletAddress);
    (usePoolViewOptions as jest.Mock).mockImplementation(mockUsePoolViewOptions);
    (useSigner as jest.Mock).mockImplementation(mockUseSigner);

    const { container } = subject();

    expect(container.firstChild).toBeNull();

    expect(mockUseLocale).toHaveBeenCalled();
    expect(mockUseSelectedChain).toHaveBeenCalled();
    expect(mockUseUserPreferences).toHaveBeenCalled();
    expect(mockUseServicesLoaded).toHaveBeenCalled();
    expect(mockUseWalletAddress).toHaveBeenCalled();
    expect(mockUsePoolViewOptions).toHaveBeenCalled();
    expect(mockUseSigner).toHaveBeenCalled();
  });
});
