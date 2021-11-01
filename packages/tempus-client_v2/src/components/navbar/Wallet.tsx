import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { LanguageContext } from '../../context/language';
import { ETHBalanceContext } from '../../context/ethBalance';
import { WalletContext } from '../../context/wallet';
import { PendingTransactionsContext } from '../../context/pendingTransactions';
import NumberUtils from '../../services/NumberUtils';
import getNotificationService from '../../services/getNotificationService';
import shortenAccount from '../../utils/shortenAccount';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import './Wallet.scss';

const supportedChainIds = [
  5, // Goerli
  1337, // Local
  31337, // AWS Private
];

const Wallet = () => {
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const { language } = useContext(LanguageContext);
  const { eth } = useContext(ETHBalanceContext);
  const { setWalletData } = useContext(WalletContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);

  const [metamaskInstalled, setMetamaskInstalled] = useState<boolean | null>(null);

  const requestNetworkChange = useCallback(async () => {
    const injectedConnector = new InjectedConnector({ supportedChainIds });
    const provider = await injectedConnector.getProvider();
    try {
      // Request user to switch to Goerli testnet
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5' }],
      });
      // If user confirms request, connect the wallet
      const onError = undefined;
      const shouldThrowErrors = true;
      await activate(injectedConnector, onError, shouldThrowErrors);
      getNotificationService().notify('Wallet connected', '');
      setWalletData &&
        setWalletData(previousData => ({
          ...previousData,
          userWalletConnected: true,
        }));
    } catch (error: any) {
      // User rejected request
      if (error.code === 4001) {
        getNotificationService().warn(
          'Request to change network rejected by user',
          'In order to use the app, please connect using Goerli network',
        );
      } else {
        getNotificationService().warn('Unsupported wallet network', 'We support Goerli network');
      }

      setWalletData &&
        setWalletData(previousData => ({
          ...previousData,
          userWalletConnected: false,
        }));
    }
  }, [activate, setWalletData]);

  const onConnect = useCallback(() => {
    const connect = async () => {
      if (active) {
        return;
      }

      const injectedConnector = new InjectedConnector({ supportedChainIds });
      try {
        await activate(injectedConnector, undefined, true);
        getNotificationService().notify('Wallet connected', '');
        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: true,
          }));
      } catch (error) {
        if (error instanceof UnsupportedChainIdError) {
          requestNetworkChange();
        } else {
          getNotificationService().warn('Error connecting wallet', '');
        }
      }
    };
    connect();
  }, [active, activate, setWalletData, requestNetworkChange]);

  const onInstallMetamaskClick = useCallback(() => {
    window.open('https://metamask.io', '_blank');
  }, []);

  useEffect(() => {
    const checkIfMetamaskIsInstalled = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();

      if (provider && provider.isMetaMask) {
        setMetamaskInstalled(true);
      } else {
        setMetamaskInstalled(false);
      }
    };
    checkIfMetamaskIsInstalled();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      injectedConnector.isAuthorized().then(async (authorized: boolean | null) => {
        const chainId = await injectedConnector.getChainId();

        // User has connected wallet, but currently selected network in user wallet is not supported.
        if (typeof chainId === 'string' && supportedChainIds.indexOf(parseInt(chainId)) === -1) {
          requestNetworkChange();
          return;
        }

        if (authorized) {
          activate(injectedConnector);
        }

        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: authorized,
          }));
      });
    };
    if (!active && metamaskInstalled) {
      checkConnection();
    }
  }, [active, metamaskInstalled, setWalletData, activate, requestNetworkChange]);

  useEffect(() => {
    if (metamaskInstalled === false) {
      setWalletData &&
        setWalletData(previousData => ({
          ...previousData,
          userWalletConnected: false,
        }));
    }
  }, [metamaskInstalled, setWalletData]);

  useEffect(() => {
    setWalletData &&
      setWalletData(previousData => ({
        ...previousData,
        userWalletSigner: library?.getSigner() || null,
        userWalletAddress: account || '',
      }));
  }, [account, library, setWalletData]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  const formattedEthBalance = useMemo(() => {
    if (!eth) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatEther(eth), 4);
  }, [eth]);

  return (
    <div className="tc__navBar__wallet">
      <div
        className="tc__connect-wallet-button__container"
        style={{
          cursor: active ? 'default' : 'pointer',
        }}
      >
        {active && formattedEthBalance && (
          <>
            <Spacer size={15} />
            <Typography variant="h5">ETH {formattedEthBalance}</Typography>
            <Spacer size={10} />
          </>
        )}
        {metamaskInstalled && (
          <div className="tc__connect-wallet-button" onClick={onConnect}>
            <AccountBalanceWalletIcon />
            <Spacer size={4} />
            {pendingTransactions.length === 0 && (
              <Typography variant="h5">{active ? shortenedAccount : getText('connectWallet', language)}</Typography>
            )}
            {pendingTransactions.length > 0 && (
              <Typography variant="h5">{pendingTransactions.length} Pending...</Typography>
            )}
          </div>
        )}
        {metamaskInstalled === false && (
          <div className="tc__connect-wallet-button" onClick={onInstallMetamaskClick}>
            <Typography variant="h5">Install Metamask</Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
