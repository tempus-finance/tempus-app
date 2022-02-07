import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { CircularProgress } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { supportedChainIds, NETWORK_URLS } from '../../constants';
import { LanguageContext } from '../../context/languageContext';
import { TokenBalanceContext } from '../../context/tokenBalanceContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import { getChainConfig } from '../../utils/getConfig';
import { selectedChainState } from '../../state/ChainState';
import NumberUtils from '../../services/NumberUtils';
import UserWallet from '../../interfaces/UserWallet';
import getText from '../../localisation/getText';
import useENS from '../../hooks/useENS';
import shortenAccount from '../../utils/shortenAccount';
import getStorageService from '../../services/getStorageService';
import getNotificationService from '../../services/getNotificationService';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import WalletSelector from './WalletSelector';
import WalletPopup from './WalletPopup';
import './Wallet.scss';

const WALLET_KEY = 'lastConnectedWallet';

const Wallet = () => {
  const { account, activate, deactivate, active, library } = useWeb3React<Web3Provider>();

  const { language } = useContext(LanguageContext);
  const { tokenBalance } = useContext(TokenBalanceContext);
  const { setWalletData } = useContext(WalletContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);
  const { setUserSettings } = useContext(UserSettingsContext);

  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const walletPopupAnchor = useRef<HTMLDivElement>(null);

  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [isUserSelected, setIsUserSelected] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<{ [w in UserWallet]?: boolean }>({
    WalletConnect: true,
  });
  const [connecting, setConnecting] = useState<boolean>(false);

  const onSelectWallet = useCallback(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletSelector: true, isWalletSelectorIrremovable: false }));
    }
  }, [setUserSettings]);

  const onCloseWalletSelector = useCallback(
    (value: UserWallet | null) => {
      if (setUserSettings) {
        setUserSettings(prevState => ({ ...prevState, openWalletSelector: false }));
      }

      if (value) {
        setSelectedWallet(value);
        setIsUserSelected(true);
      }
    },
    [setUserSettings, setIsUserSelected],
  );

  const onOpenWalletPopup = useCallback(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletPopup: true }));
    }
  }, [setUserSettings]);

  const onCloseWalletPopup = useCallback(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletPopup: false }));
    }
  }, [setUserSettings]);

  const onSwitchWallet = useCallback(async () => {
    setConnecting(false);
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletPopup: false, openWalletSelector: true }));
    }
  }, [setUserSettings]);

  const requestNetworkChange = useCallback(
    async (chainId: number) => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();
      try {
        // Request user to switch to Mainnet
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        // If user confirms request, connect the wallet
        const onError = undefined;
        const shouldThrowErrors = true;
        await activate(injectedConnector, onError, shouldThrowErrors);
        if (isUserSelected) {
          getNotificationService().notify('Wallet', getText('metamaskConnected', language), '');
        }
        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: true,
          }));
      } catch (error) {
        // User rejected request
        if ((error as any).code === 4001) {
          getNotificationService().warn(
            'Wallet',
            getText('changeNetworkRejected', language),
            getText('changeNetworkRejectedExplain', language),
          );
        } else {
          getNotificationService().warn(
            'Wallet',
            getText('unsupportedNetwork', language),
            getText('unsupportedNetworkExplain', language),
          );
        }

        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: false,
          }));
      }
    },
    [isUserSelected, language, activate, setWalletData],
  );

  const onMetaMaskSelected = useCallback(
    (lastSelectedWallet?: UserWallet) => {
      const connect = async (lastSelectedWallet?: UserWallet) => {
        if (active && lastSelectedWallet === 'MetaMask') {
          setConnecting(false);
          return;
        }

        if (active) {
          deactivate();
        }
        const injectedConnector = new InjectedConnector({ supportedChainIds });
        try {
          await activate(injectedConnector, undefined, true);
          getStorageService().set(WALLET_KEY, 'MetaMask');
          setSelectedWallet('MetaMask');
          if (isUserSelected) {
            getNotificationService().notify('Wallet', getText('metamaskConnected', language), '');
          }
          setWalletData &&
            setWalletData(previousData => ({
              ...previousData,
              userWalletConnected: true,
            }));
        } catch (error) {
          setSelectedWallet(null);
          console.error('onMetaMaskSelected', error);
          if (error instanceof UnsupportedChainIdError) {
            // TODO - We should probably request network change to network that is currently selected in the app network selector
            // Request user to change network to ethereum mainnet
            requestNetworkChange(1);
          } else {
            getNotificationService().warn('Wallet', getText('errorConnectingWallet', language), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    [isUserSelected, language, active, activate, deactivate, setWalletData, requestNetworkChange],
  );

  const onWalletConnectSelected = useCallback(
    (lastSelectedWallet?: UserWallet) => {
      const connect = async (lastSelectedWallet?: UserWallet) => {
        if (active && lastSelectedWallet === 'WalletConnect') {
          setConnecting(false);
          return;
        }

        if (active) {
          deactivate();
        }

        const walletConnector = new WalletConnectConnector({
          supportedChainIds: [...supportedChainIds],
          rpc: NETWORK_URLS,
          qrcode: true,
        });

        try {
          await activate(walletConnector, undefined, true);
          getStorageService().set(WALLET_KEY, 'WalletConnect');
          setSelectedWallet('WalletConnect');
          if (isUserSelected) {
            getNotificationService().notify('Wallet', getText('walletConnectConnected', language), '');
          }
          setWalletData &&
            setWalletData(previousData => ({
              ...previousData,
              userWalletConnected: true,
            }));
        } catch (error) {
          setSelectedWallet(null);
          console.error('onWalletConnectSelected', error);
          if (error instanceof UnsupportedChainIdError) {
            // TODO - We should probably request network change to network that is currently selected in the app network selector
            // Request user to change network to ethereum mainnet
            requestNetworkChange(1);
          } else {
            getNotificationService().warn('Wallet', getText('errorConnectingWallet', language), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    [isUserSelected, language, active, activate, deactivate, setWalletData, requestNetworkChange],
  );

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
    const checkMetaMaskConnection = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();
      if (provider) {
        injectedConnector.isAuthorized().then(async (authorized: boolean | null) => {
          const chainId = await injectedConnector.getChainId();

          // User has connected wallet, but currently selected network in user wallet is not supported.
          if (typeof chainId === 'string' && !supportedChainIds.includes(parseInt(chainId))) {
            // TODO - We should probably request network change to network that is currently selected in the app network selector
            // Request user to change network to ethereum mainnet
            requestNetworkChange(1);
            return;
          }
          if (authorized) {
            await activate(injectedConnector, undefined, true);
            setSelectedWallet('MetaMask');
          } else {
            setSelectedWallet(null);
          }
          setWalletData &&
            setWalletData(previousData => ({
              ...previousData,
              userWalletConnected: authorized,
            }));
        });
      } else {
        setSelectedWallet(null);
      }
    };

    const checkWalletConnectConnection = async () => {
      const walletConnector = new WalletConnectConnector({
        supportedChainIds: [...supportedChainIds],
        rpc: NETWORK_URLS,
        qrcode: true,
      });

      const provider = await walletConnector.getProvider();
      if (provider) {
        walletConnector.walletConnectProvider.isAuthorized().then(async (authorized: boolean | null) => {
          const chainId = await walletConnector.getChainId();

          // User has connected wallet, but currently selected network in user wallet is not supported.
          if (typeof chainId === 'string' && !supportedChainIds.includes(parseInt(chainId))) {
            // TODO - We should probably request network change to network that is currently selected in the app network selector
            // Request user to change network to ethereum mainnet
            requestNetworkChange(1);
            return;
          }
          if (authorized) {
            await activate(walletConnector, undefined, true);
            setSelectedWallet('WalletConnect');
          } else {
            setSelectedWallet(null);
          }
          setWalletData &&
            setWalletData(previousData => ({
              ...previousData,
              userWalletConnected: authorized,
            }));
        });
      } else {
        setSelectedWallet(null);
      }
    };

    if (!active) {
      const lastSelectedWallet = getStorageService().get(WALLET_KEY) as UserWallet;
      if (lastSelectedWallet === 'WalletConnect') {
        checkWalletConnectConnection();
      } else {
        checkMetaMaskConnection();
      }
    }
  }, [active, setWalletData, activate, requestNetworkChange, setSelectedWallet]);

  useEffect(() => {
    const lastSelectedWallet = getStorageService().get(WALLET_KEY) as UserWallet;
    if (selectedWallet === 'MetaMask') {
      onMetaMaskSelected(lastSelectedWallet);
    } else if (selectedWallet === 'WalletConnect') {
      onWalletConnectSelected(lastSelectedWallet);
    }
  }, [selectedWallet, onMetaMaskSelected, onWalletConnectSelected]);

  useEffect(() => {
    setWalletData &&
      setWalletData(previousData => ({
        ...previousData,
        userWalletSigner: library?.getSigner() || null,
        userWalletAddress: account || '',
      }));
  }, [account, library, setWalletData]);
  const { ensName, ensAvatar } = useENS(account);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  const formattedPrimaryTokenBalance = useMemo(() => {
    if (!tokenBalance || !selectedWallet) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatEther(tokenBalance), 4);
  }, [tokenBalance, selectedWallet]);

  return (
    <>
      <WalletSelector
        currentWallet={selectedWallet}
        availableWallets={availableWallets}
        onClose={onCloseWalletSelector}
      />
      <div className="tc__navBar__wallet">
        {/* Wallet is connecting - show progress circle */}
        {connecting && <CircularProgress size={18} />}

        {/* Wallet not connected - show connect wallet button */}
        {!connecting && !selectedWallet && (
          <div className="tc__connect-wallet-button" onClick={onSelectWallet}>
            <Typography variant="button-text">{getText('connectWallet', language)}</Typography>
          </div>
        )}

        {/* Wallet connected - show wallet info */}
        {!connecting && selectedWallet && active && formattedPrimaryTokenBalance && selectedChainName && (
          <div className="tc__connect-wallet-button" onClick={onOpenWalletPopup} ref={walletPopupAnchor}>
            {/* In case ENS avatar is available we need to show it instead of generic wallet icon */}
            <div className="tc__connect-wallet-button__profile">
              {ensAvatar ? <img src={ensAvatar} alt={shortenedAccount} /> : <AccountBalanceWalletIcon />}
            </div>

            <Spacer size={8} />

            {/* In case there are no pending transactions, show wallet address or ENS name if it's available */}
            {pendingTransactions.length === 0 && (
              <div className="tc__connect-wallet-button__info">
                <Typography variant="wallet-info">{ensName || shortenedAccount}</Typography>
                <div className="tc__connect-wallet-button__balance">
                  <Typography variant="wallet-info-bold">{formattedPrimaryTokenBalance}</Typography>
                  <Spacer size={8} />
                  <Typography variant="wallet-info">{getChainConfig(selectedChainName).nativeToken}</Typography>
                </div>
              </div>
            )}

            {/* In case there are pending transactions, show number of pending transactions */}
            {pendingTransactions.length > 0 && (
              <Typography variant="h5">
                {pendingTransactions.length} {getText('pending', language)}
              </Typography>
            )}
          </div>
        )}
      </div>
      {selectedChainName && (
        <WalletPopup
          anchorElement={walletPopupAnchor}
          account={account}
          chainName={selectedChainName}
          onSwitchWallet={onSwitchWallet}
          onClose={onCloseWalletPopup}
        />
      )}
    </>
  );
};

export default Wallet;
