import { FC, useCallback } from 'react';
import { init, useConnectWallet } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { ButtonWrapper, colors, Icon, Logo, Typography, WalletButton } from '../shared';

import './Navbar.scss';

const injected = injectedModule();

init({
  wallets: [injected],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/CikBd5PRY8HTC1rBQw1dBq5HlOfXwe0O',
    },
  ],
  appMetadata: {
    name: 'Tempus App',
    icon: '<svg><svg/>',
    description: 'Official Tempus App',
    recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
  },
});

const Navbar: FC = () => {
  const [{ wallet }, connect] = useConnectWallet();

  const onConnectWallet = useCallback(() => {
    connect({});
  }, [connect]);

  return (
    <div className="tc__navbar">
      <Logo type="protocol-Tempus" />
      <div className="tc__navbar-actions">
        <ButtonWrapper>
          <div className="tc__navbar-actions-dropdown">
            <Typography variant="body-primary" color="text-primary-inverted">
              Settings
            </Typography>
            <div className="tc__navbar-actions-dropdown-icon">
              <Icon variant="down-chevron" size={12} color={colors.textPrimaryInverted} />
            </div>
          </div>
        </ButtonWrapper>
        {/* TODO - Integrate wallet button logic */}
        <WalletButton
          address={wallet?.accounts[0].address || ''}
          balance=""
          chain="ethereum"
          onConnect={onConnectWallet}
          onNetworkClick={() => {}}
          onWalletClick={() => {}}
        />
      </div>
    </div>
  );
};
export default Navbar;
