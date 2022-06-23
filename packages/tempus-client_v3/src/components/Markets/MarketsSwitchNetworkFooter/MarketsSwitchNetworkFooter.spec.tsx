import { fireEvent, render } from '@testing-library/react';
import { useSetChain } from '@web3-onboard/react';
import { chainNameToHexChainId } from 'tempus-core-services';
import { getConfigManager } from '../../../config/getConfigManager';
import { useSelectedChain } from '../../../hooks';
import MarketsSwitchNetworkFooter from './MarketsSwitchNetworkFooter';

const mockSetChain = jest.fn<void, [{ chainId: string }]>();

const subject = () => render(<MarketsSwitchNetworkFooter />);

jest.mock('@web3-onboard/react', () => ({
  useSetChain: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useSelectedChain: jest.fn(),
}));

describe('MarketsSwitchNetworkFooter', () => {
  it('does not render footer if a chain is not selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: null }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue([null]);

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders multi-chain footer if Ethereum chain is selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('ethereum') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum', () => {}]);

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('opens chain selector when multi-chain footer is presented', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('ethereum') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum', () => {}]);

    const { container, getByRole } = subject();

    const switchButton = getByRole('button');

    expect(container).not.toBeNull();
    expect(switchButton).not.toBeNull();

    fireEvent.click(switchButton);

    const chainSelector = container.querySelector('.tc__chainSelector .tc__modal');

    expect(chainSelector).not.toBeNull();
  });

  it('renders Fantom footer if Ethereum chain is selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('ethereum') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum', () => {}]);
    jest.spyOn(getConfigManager(), 'getChainList').mockReturnValue(['ethereum', 'fantom']);

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('switches to Fantom if Ethereum chain is selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('ethereum') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum', () => {}]);
    jest.spyOn(getConfigManager(), 'getChainList').mockReturnValue(['ethereum', 'fantom']);

    const { getByRole } = subject();

    const switchButton = getByRole('button');

    expect(switchButton).not.toBeNull();

    fireEvent.click(switchButton);

    expect(mockSetChain).toHaveBeenCalledTimes(1);
    expect(mockSetChain).toHaveBeenCalledWith({ chainId: chainNameToHexChainId('fantom') });
  });

  it('renders Ethereum footer if Fantom chain is selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('fantom') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['fantom', () => {}]);
    jest.spyOn(getConfigManager(), 'getChainList').mockReturnValue(['ethereum', 'fantom']);

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('switches to Ethereum if Fantom chain is selected', () => {
    (useSetChain as jest.Mock).mockReturnValue([{ connectedChain: chainNameToHexChainId('fantom') }, mockSetChain]);
    (useSelectedChain as jest.Mock).mockReturnValue(['fantom', () => {}]);
    jest.spyOn(getConfigManager(), 'getChainList').mockReturnValue(['ethereum', 'fantom']);

    const { getByRole } = subject();

    const switchButton = getByRole('button');

    expect(switchButton).not.toBeNull();

    fireEvent.click(switchButton);

    expect(mockSetChain).toHaveBeenCalledTimes(1);
    expect(mockSetChain).toHaveBeenCalledWith({ chainId: chainNameToHexChainId('ethereum') });
  });
});
