import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { CircularProgress } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { supportedChainIds, NETWORK_URLS } from '../../constants';
import { LanguageContext } from '../../context/languageContext';
import { ETHBalanceContext } from '../../context/ethBalanceContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { WalletContext } from '../../context/walletContext';
import NumberUtils from '../../services/NumberUtils';
import UserWallet from '../../interfaces/UserWallet';
import getText from '../../localisation/getText';
import shortenAccount from '../../utils/shortenAccount';
import getNotificationService from '../../services/getNotificationService';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import WalletSelector from './WalletSelector';
import './Wallet.scss';

const Wallet = () => {
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const { language } = useContext(LanguageContext);
  const { eth } = useContext(ETHBalanceContext);
  const { setWalletData } = useContext(WalletContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);

  const [walletSelectorOpen, setWalletSelectorOpen] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [availableWallets, setAvailableWallets] = useState<{ [w in UserWallet]?: boolean }>({
    WalletConnect: true,
  });
  const [connecting, setConnecting] = useState<boolean>(false);

  const onSelectWallet = useCallback(() => {
    setWalletSelectorOpen(true);
  }, []);

  const onCloseWalletSelector = useCallback(
    (value: UserWallet | null) => {
      setWalletSelectorOpen(false);
      if (value) {
        setSelectedWallet(value);
      }
    },
    [setWalletSelectorOpen],
  );

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

  const onMetaMaskSelected = useCallback(() => {
    setConnecting(true);
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
        setSelectedWallet(null);
        console.error('onMetaMaskSelected', error);
        if (error instanceof UnsupportedChainIdError) {
          requestNetworkChange();
        } else {
          getNotificationService().warn('Error connecting wallet', '');
        }
      }
      setConnecting(false);
    };
    connect();
  }, [active, activate, setWalletData, requestNetworkChange]);

  const onWalletConnectSelected = useCallback(() => {
    setConnecting(true);
    const connect = async () => {
      if (active) {
        return;
      }

      const walletConnector = new WalletConnectConnector({
        supportedChainIds: [...supportedChainIds],
        rpc: NETWORK_URLS,
        qrcode: true,
      });

      try {
        await activate(walletConnector, undefined, true);
        getNotificationService().notify('Wallet connected', '');
        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: true,
          }));
      } catch (error) {
        setSelectedWallet(null);
        console.error('onWalletConnectSelected', error);
        if (error instanceof UnsupportedChainIdError) {
          requestNetworkChange();
        } else {
          getNotificationService().warn('Error connecting wallet', '');
        }
      }
      setConnecting(false);
    };
    connect();
  }, [active, activate, setWalletData, requestNetworkChange]);

  useEffect(() => {
    if (selectedWallet === 'MetaMask') {
      onMetaMaskSelected();
    } else if (selectedWallet === 'WalletConnect') {
      onWalletConnectSelected();
    }
  }, [selectedWallet, onMetaMaskSelected, onWalletConnectSelected]);

  useEffect(() => {
    const checkIfMetamaskIsInstalled = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();

      if (provider && provider.isMetaMask) {
        setAvailableWallets(prev => ({ ...prev, MetaMask: true }));
      } else {
        setAvailableWallets(prev => ({ ...prev, MetaMask: false }));
      }
    };
    checkIfMetamaskIsInstalled();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();
      if (provider) {
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
          const isMetaMask = provider.isMetaMask;
          setSelectedWallet(!!isMetaMask ? 'MetaMask' : 'WalletConnect');
        });
      }
      setSelectedWallet(null);
    };
    if (!active) {
      checkConnection();
    }
  }, [active, setWalletData, activate, requestNetworkChange, setSelectedWallet]);

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
    <>
      <WalletSelector
        open={walletSelectorOpen}
        currentWallet={selectedWallet}
        availableWallets={availableWallets}
        onClose={onCloseWalletSelector}
      />
      <div className="tc__navBar__wallet">
        {connecting && <CircularProgress />}
        <div
          className="tc__connect-wallet-button__container"
          style={{
            cursor: active ? 'default' : 'pointer',
          }}
        >
          {!connecting && !selectedWallet && (
            <div className="tc__connect-wallet-button" onClick={onSelectWallet}>
              <Typography variant="h5">{getText('connectWallet', language)}</Typography>
            </div>
          )}
          {!connecting && active && formattedEthBalance && (
            <>
              <Spacer size={15} />
              <Typography variant="h5">ETH {formattedEthBalance}</Typography>
              <Spacer size={10} />
            </>
          )}

          {!connecting && selectedWallet && active && (
            <div className="tc__connect-wallet-button" onClick={onSelectWallet}>
              <AccountBalanceWalletIcon />
              <Spacer size={4} />
              {pendingTransactions.length === 0 && <Typography variant="h5">{shortenedAccount}</Typography>}
              {pendingTransactions.length > 0 && (
                <Typography variant="h5">
                  {pendingTransactions.length} {getText('pending', language)}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wallet;
