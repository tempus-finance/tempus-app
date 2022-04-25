import { FC, useCallback, useEffect, useMemo } from 'react';
import ledgerModule from '@web3-onboard/ledger';
import injectedModule from '@web3-onboard/injected-wallets';
import { init, useConnectWallet, useWallets } from '@web3-onboard/react';
import { WalletButton } from '../shared';

// Fetch wallet modules
const injected = injectedModule();
const ledger = ledgerModule();

// Init wallet library before using it
init({
  wallets: [injected, ledger],
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

const Wallet: FC = () => {
  const connectedWallets = useWallets();
  const [{ wallet }, connect] = useConnectWallet();

  // TODO - Store wallet data in global state store
  // (Hookstate, or something else once we decide what we want to use for global state management)

  /**
   * When user clicks on connect wallet button show a modal with all available wallets users can connect.
   */
  const onConnectWallet = useCallback(() => {
    connect({});
  }, [connect]);

  /**
   * Every time list of connected wallets changes, we want to store labels of those wallets in local storage.
   * Next time user opens the app, we will use this data to auto-connect wallet for the user.
   */
  useEffect(() => {
    const connectedWalletLabels = connectedWallets.map(connectedWallet => connectedWallet.label);

    if (connectedWalletLabels.length > 0) {
      window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletLabels));
    }
  }, [connectedWallets]);

  /**
   * Check if user already connected any of his wallets in previous sessions, if yes,
   * automatically connect first wallet from list of previously connected wallets.
   */
  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets') || '[]') as string[];
    if (previouslyConnectedWallets && previouslyConnectedWallets.length > 0) {
      connect({
        autoSelect: {
          disableModals: true,
          label: previouslyConnectedWallets[0],
        },
      });
    }
  }, [connect]);

  const walletAddress = useMemo(() => {
    if (!wallet) {
      return null;
    }
    return wallet.accounts[0].address;
  }, [wallet]);

  return (
    <WalletButton
      address={walletAddress || ''}
      balance=""
      chain="ethereum"
      onConnect={onConnectWallet}
      onNetworkClick={() => {}}
      onWalletClick={() => {}}
    />
  );
};
export default Wallet;
