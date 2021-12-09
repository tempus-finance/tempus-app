import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { CircularProgress } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { supportedChainIds, NETWORK_URLS, SupportedChainId } from '../../constants';
import { LanguageContext } from '../../context/languageContext';
import { ETHBalanceContext } from '../../context/ethBalanceContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import NumberUtils from '../../services/NumberUtils';
import UserWallet from '../../interfaces/UserWallet';
import getText from '../../localisation/getText';
import shortenAccount from '../../utils/shortenAccount';
import getNotificationService from '../../services/getNotificationService';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import WalletSelector from './WalletSelector';
import WalletPopup from './WalletPopup';
import './Wallet.scss';

const Wallet = () => {
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const { language } = useContext(LanguageContext);
  const { eth } = useContext(ETHBalanceContext);
  const { setWalletData } = useContext(WalletContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);
  const { openWalletPopup, setUserSettings } = useContext(UserSettingsContext);

  const walletPopupAnchor = useRef<HTMLDivElement>(null);

  const [walletSelectorOpen, setWalletSelectorOpen] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [isUserSelected, setIsUserSelected] = useState<boolean>(false);
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
        setIsUserSelected(true);
      }
    },
    [setWalletSelectorOpen, setIsUserSelected],
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

  const requestNetworkChange = useCallback(async () => {
    const injectedConnector = new InjectedConnector({ supportedChainIds });
    const provider = await injectedConnector.getProvider();
    try {
      // Request user to switch to Mainnet
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SupportedChainId.MAINNET }],
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
  }, [isUserSelected, language, activate, setWalletData]);

  const onMetaMaskSelected = useCallback(() => {
    setConnecting(true);
    const connect = async () => {
      if (active) {
        return;
      }

      const injectedConnector = new InjectedConnector({ supportedChainIds });
      try {
        await activate(injectedConnector, undefined, true);
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
          requestNetworkChange();
        } else {
          getNotificationService().warn('Wallet', getText('errorConnectingWallet', language), '');
        }
      }
      setConnecting(false);
    };
    connect();
  }, [isUserSelected, language, active, activate, setWalletData, requestNetworkChange]);

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
          requestNetworkChange();
        } else {
          getNotificationService().warn('Wallet', getText('errorConnectingWallet', language), '');
        }
      }
      setConnecting(false);
    };
    connect();
  }, [isUserSelected, language, active, activate, setWalletData, requestNetworkChange]);

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
          if (typeof chainId === 'string' && !supportedChainIds.includes(parseInt(chainId))) {
            requestNetworkChange();
            return;
          }
          if (authorized) {
            activate(injectedConnector);
            const isMetaMask = provider.isMetaMask;
            setSelectedWallet(!!isMetaMask ? 'MetaMask' : 'WalletConnect');
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
            <div
              className="tc__connect-wallet-button tc__connect-wallet-button__connected"
              onClick={onOpenWalletPopup}
              ref={walletPopupAnchor}
            >
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
      <WalletPopup
        anchorElement={walletPopupAnchor}
        open={openWalletPopup}
        account={account}
        onClose={onCloseWalletPopup}
      />
    </>
  );
};

export default Wallet;
