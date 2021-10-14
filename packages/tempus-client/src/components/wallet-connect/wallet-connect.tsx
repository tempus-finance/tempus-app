import { FC, useCallback, useEffect, useContext, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import shortenAccount from '../../utils/shorten-account';
import getNotificationService from '../../services/getNotificationService';
import NumberUtils from '../../services/NumberUtils';
import { Context } from '../../context';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';

import './wallet-connect.scss';

export const CONNECT_WALLET = 'Connect Wallet';

const supportedChainIds = [
  5, // Goerli
  1337, // Local
  31337, // AWS Private
];

const WalletConnect: FC = (): JSX.Element => {
  const {
    data: { pendingTransactions, userEthBalance },
    setData,
  } = useContext(Context);

  const { account, activate, active, library } = useWeb3React<Web3Provider>();

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
      setData &&
        setData(previousData => ({
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

      setData &&
        setData(previousData => ({
          ...previousData,
          userWalletConnected: false,
        }));
    }
  }, [activate, setData]);

  const onConnect = useCallback(() => {
    const connect = async () => {
      if (active) {
        return;
      }

      const injectedConnector = new InjectedConnector({ supportedChainIds });
      try {
        await activate(injectedConnector, undefined, true);
        getNotificationService().notify('Wallet connected', '');
        setData &&
          setData(previousData => ({
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
  }, [active, activate, setData, requestNetworkChange]);

  const onInstallMetamask = useCallback(() => {
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

        setData &&
          setData(previousData => ({
            ...previousData,
            userWalletConnected: authorized,
          }));
      });
    };
    if (!active && metamaskInstalled) {
      checkConnection();
    }
  }, [active, metamaskInstalled, activate, setData, requestNetworkChange]);

  useEffect(() => {
    if (metamaskInstalled === false) {
      setData &&
        setData(previousData => ({
          ...previousData,
          userWalletConnected: false,
        }));
    }
  }, [metamaskInstalled, setData]);

  useEffect(() => {
    setData &&
      setData(previousData => ({
        ...previousData,
        userWalletSigner: library?.getSigner() || null,
        userWalletAddress: account || '',
      }));
  }, [account, library, setData]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  const formattedEthBalance = useMemo(() => {
    if (!userEthBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userEthBalance), 4);
  }, [userEthBalance]);

  return (
    <div
      className="tf__connect__wallet-container"
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
        <div className="tf__connect__wallet-button" onClick={onConnect}>
          <AccountBalanceWalletIcon />
          <Spacer size={4} />
          {pendingTransactions.length === 0 && (
            <Typography variant="h5">{active ? shortenedAccount : CONNECT_WALLET}</Typography>
          )}
          {pendingTransactions.length > 0 && (
            <Typography variant="h5">{pendingTransactions.length} Pending...</Typography>
          )}
        </div>
      )}
      {metamaskInstalled === false && (
        <div className="tf__connect__wallet-button" onClick={onInstallMetamask}>
          <Typography variant="h5">Install Metamask</Typography>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
