import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import ledgerModule from '@web3-onboard/ledger';
import gnosisModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import { init, useConnectWallet, useWallets } from '@web3-onboard/react';
import {
  DecimalUtils,
  ethereumChainIdHex,
  ethereumForkChainIdHex,
  fantomChainIdHex,
  ZERO_ADDRESS,
} from 'tempus-core-services';
import { WalletButton } from '../shared';
import ChainSelector from '../ChainSelector';
import { setWalletAddress, useSelectedChain, useTokenBalance } from '../../hooks';

// TODO - Check with designers if block native UI for wallet management is fine to use

import tempusLogo from './svg/Logo.svg'; // TODO - Check with designers if logo and icons are fine.
import tempusIcon from './png/Icon.png'; // TODO - Replace with svg image

// Fetch wallet modules
const injected = injectedModule();
const ledger = ledgerModule();
const gnosis = gnosisModule();

// Init wallet library before using it
init({
  wallets: [injected, ledger, gnosis], // List of wallets we want to support
  chains: [
    // List of chains we want to support
    {
      id: ethereumChainIdHex,
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: process.env.REACT_APP_ETHEREUM_RPC || '',
    },
    {
      id: fantomChainIdHex,
      token: 'FTM',
      label: 'Fantom',
      rpcUrl: process.env.REACT_APP_FANTOM_RPC || '',
    },
    {
      id: ethereumForkChainIdHex,
      token: 'ETH',
      label: 'Ethereum Fork',
      rpcUrl: process.env.REACT_APP_ETHEREUM_FORK_RPC || '',
    },
  ],
  appMetadata: {
    name: 'Tempus App',
    logo: tempusLogo,
    icon: tempusIcon,
    description: 'Official Tempus App',
    recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
    agreement: {
      version: '1.0',
      privacyUrl: 'https://tempus.finance/privacy-policy',
      termsUrl: 'https://tempus.finance/terms-of-service',
    },
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
  const selectedChain = useSelectedChain();

  const nativeTokenBalance = useTokenBalance(ZERO_ADDRESS, selectedChain);

  const [chainSelectorOpen, setChainSelectorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (wallet) {
      setWalletAddress(wallet.accounts[0].address);
    }
  }, [wallet]);

  // TODO - Delete local storage under 'connectedWallets' when user disconnects the wallet

  /**
   * When user clicks on connect wallet button show a modal with all available wallets users can connect.
   */
  const onConnectWallet = useCallback(() => {
    connect({});
  }, [connect]);

  const onOpenChainSelector = useCallback(() => {
    setChainSelectorOpen(true);
  }, []);

  const onCloseChainSelector = useCallback(() => {
    setChainSelectorOpen(false);
  }, []);

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

  const balance = useMemo(() => {
    if (!nativeTokenBalance) {
      return null;
    }

    // TODO - Add number of decimals for chain native token in the config and use it here.
    return DecimalUtils.formatToCurrency(nativeTokenBalance, 2);
  }, [nativeTokenBalance]);

  return (
    <>
      <WalletButton
        address={walletAddress || ''}
        balance={balance || ''}
        chain={selectedChain ?? 'unsupported'}
        onConnect={onConnectWallet}
        onNetworkClick={onOpenChainSelector}
        // TODO - Add wallet popup
        onWalletClick={() => {}}
      />
      <ChainSelector open={chainSelectorOpen} onClose={onCloseChainSelector} />
    </>
  );
};
export default Wallet;
