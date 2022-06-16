import { JsonRpcSigner } from '@ethersproject/providers';
import ledgerModule from '@web3-onboard/ledger';
import gnosisModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import { init, useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chain,
  chainNameToHexChainId,
  DecimalUtils,
  ethereumChainIdHex,
  ethereumForkChainIdHex,
  fantomChainIdHex,
  ZERO_ADDRESS,
} from 'tempus-core-services';
import { useWalletAddress, useSelectedChain, useTokenBalance, useSigner } from '../../hooks';
import { ActionButtonVariant, WalletButton } from '../shared';
import ChainSelector from '../ChainSelector';

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

export interface WalletProps {
  connectWalletButtonVariant?: ActionButtonVariant;
  onConnectWalletClick?: () => void;
  redirectTo?: string;
}

const Wallet: FC<WalletProps> = props => {
  const { connectWalletButtonVariant, onConnectWalletClick, redirectTo } = props;
  const connectedWallets = useWallets();
  const [{ wallet }, connect] = useConnectWallet();
  const [, setWalletAddress] = useWalletAddress();
  const [selectedChain] = useSelectedChain();
  const [, setChain] = useSetChain();
  const [, setSigner] = useSigner();

  const nativeTokenBalanceData = useTokenBalance(ZERO_ADDRESS, selectedChain);

  const [chainSelectorOpen, setChainSelectorOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  /**
   * Redirects after wallet is connected, if needed.
   */
  useEffect(() => {
    if (wallet && redirectTo) {
      const match = redirectTo.match(/^\/pool\/([a-z-]+)\/[a-zA-Z]+\/[a-z-]+$/);

      if (match) {
        const chain = match[1] as Chain;
        const hexChainId = chainNameToHexChainId(chain);

        if (hexChainId) {
          setChain({
            chainId: hexChainId,
          });
        }
      }

      navigate(redirectTo);
    }
  }, [navigate, redirectTo, setChain, wallet]);

  useEffect(() => {
    if (wallet) {
      setWalletAddress(wallet.accounts[0].address);
    }
  }, [wallet, setWalletAddress]);

  // TODO - Delete local storage under 'connectedWallets' when user disconnects the wallet

  /**
   * When user clicks on connect wallet button show a modal with all available wallets users can connect.
   */
  const onConnectWallet = useCallback(async () => {
    onConnectWalletClick?.();
    await connect({});
  }, [connect, onConnectWalletClick]);

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

  useEffect(() => {
    if (wallet && wallet.provider) {
      const signer = new ethers.providers.Web3Provider(wallet.provider).getSigner() as JsonRpcSigner;
      setSigner(signer);
    }
  }, [wallet, setSigner]);

  const walletAddress = useMemo(() => {
    if (!wallet) {
      return null;
    }
    return wallet.accounts[0].address;
  }, [wallet]);

  const balance = useMemo(() => {
    if (!nativeTokenBalanceData || !nativeTokenBalanceData.balance) {
      return null;
    }

    // TODO - Add number of decimals for chain native token in the config and use it here.
    return DecimalUtils.formatToCurrency(nativeTokenBalanceData.balance, 2);
  }, [nativeTokenBalanceData]);

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
        connectWalletButtonVariant={connectWalletButtonVariant}
      />
      <ChainSelector open={chainSelectorOpen} onClose={onCloseChainSelector} />
    </>
  );
};
export default Wallet;
