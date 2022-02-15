import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { CircularProgress } from '@material-ui/core';
import { supportedChainIds, NETWORK_URLS } from '../../constants';
import { LanguageContext } from '../../context/languageContext';
import { TokenBalanceContext } from '../../context/tokenBalanceContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import { getChainConfig } from '../../utils/getConfig';
import { selectedChainState, unsupportedNetworkState } from '../../state/ChainState';
import NumberUtils from '../../services/NumberUtils';
import UserWallet from '../../interfaces/UserWallet';
import { chainToTicker, chainIdToChainName, Chain } from '../../interfaces/Chain';
import getText from '../../localisation/getText';
import useENS from '../../hooks/useENS';
import shortenAccount from '../../utils/shortenAccount';
import getChainNameFromId from '../../utils/getChainNameFromId';
import getStorageService from '../../services/getStorageService';
import getNotificationService from '../../services/getNotificationService';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import ChainSelectorPopup from '../navbar/ChainSelectorPopup';
import WalletSelector from './WalletSelector';
import WalletPopup from './WalletPopup';
import WalletAvatar from './WalletAvatar';
import TokenIcon from '../tokenIcon';
import WarnIcon from '../icons/WarnIcon';
import InfoTooltip from '../infoTooltip/infoTooltip';
import WalletUnsupportedTooltip from './WalletUnsupportedTooltip';

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
  const unsupportedNetwork = useHookState(unsupportedNetworkState);

  const selectedChainName = selectedChain.attach(Downgraded).get();
  const isUnsupportedNetwork = unsupportedNetwork.attach(Downgraded).get();

  const walletPopupAnchor = useRef<HTMLDivElement>(null);

  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [availableWallets, setAvailableWallets] = useState<{ [w in UserWallet]?: boolean }>({
    WalletConnect: true,
  });
  const [connecting, setConnecting] = useState<boolean>(false);
  const [chainSelectorOpen, setChainSelectorOpen] = useState<boolean>(false);
  const unsupportedNetworkRef = useRef<HTMLDivElement>(null);

  const onOpenChainSelector = useCallback(() => {
    setChainSelectorOpen(true);
  }, []);

  const onCloseChainSelector = useCallback(() => {
    setChainSelectorOpen(false);
  }, []);

  const onSelectWallet = useCallback(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletSelector: true, isWalletSelectorIrremovable: false }));
    }
  }, [setUserSettings]);

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

  const onClickUnsupportedNetworkButton = useCallback(() => {
    unsupportedNetworkRef.current && unsupportedNetworkRef.current.click();
    onOpenChainSelector();
  }, [unsupportedNetworkRef, onOpenChainSelector]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const subscribeToNetworkChanges = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();

      provider.on('networkChanged', (chainId: string) => {
        const selected = chainIdToChainName(chainId);
        if (selected) {
          selectedChain.set(selected);
          unsupportedNetwork.set(false);
        } else {
          selectedChain.set(null);
          unsupportedNetwork.set(true);
        }
      });
    };
    subscribeToNetworkChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const requestAddNetwork = useCallback(
    async (
      chainId: string,
      name: string,
      tokenName: string,
      tokenTicker: string,
      tokenDecimals: number,
      rpc: string,
      blockExplorer: string,
    ): Promise<boolean> => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              chainName: name,
              nativeCurrency: {
                name: tokenName,
                symbol: tokenTicker,
                decimals: tokenDecimals,
              },
              rpcUrls: [rpc],
              blockExplorerUrls: [blockExplorer],
            },
          ],
        });

        return true;
      } catch (error) {
        console.error(error);

        return false;
      }
    },
    [],
  );

  const requestNetworkChange = useCallback(
    async (
      chainId: string,
      showWalletConnectedNotification: boolean,
      showRejectedNotification: boolean,
    ): Promise<boolean> => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();
      const chain = chainIdToChainName(chainId);

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
        if (showWalletConnectedNotification) {
          chain && getNotificationService().notify(chain, 'Wallet', getText('metamaskConnected', language), '');
        }

        if (typeof chainId === 'string') {
          selectedChainState.set(getChainNameFromId(parseInt(chainId)));
        }

        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: true,
          }));

        // User accepted network change request - return true
        return true;
      } catch (error) {
        // User rejected request
        if ((error as any).code === 4001) {
          showRejectedNotification &&
            chain &&
            getNotificationService().warn(
              chain,
              'Wallet',
              getText('changeNetworkRejected', language),
              getText('changeNetworkRejectedExplain', language),
            );
          // Network we tried to switch to is not yet added to MetaMask
        } else if ((error as any).code === 4902) {
          throw new Error('Unknown Network');
        } else {
          chain &&
            getNotificationService().warn(
              chain,
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

        // User rejected network change request - return false
        return false;
      }
    },
    [language, activate, setWalletData],
  );

  const onMetaMaskSelected = useCallback(
    (showWalletConnectedNotification: boolean, lastSelectedWallet?: UserWallet) => {
      const connect = async (lastSelectedWallet?: UserWallet) => {
        if (active && lastSelectedWallet === 'MetaMask') {
          setConnecting(false);
          return;
        }

        if (active) {
          deactivate();
        }
        const injectedConnector = new InjectedConnector({ supportedChainIds });
        const chainId = await injectedConnector.getChainId();
        const chain = chainIdToChainName(chainId.toString());
        try {
          await activate(injectedConnector, undefined, true);
          getStorageService().set(WALLET_KEY, 'MetaMask');
          setSelectedWallet('MetaMask');
          if (showWalletConnectedNotification && chain) {
            getNotificationService().notify(chain, 'Wallet', getText('metamaskConnected', language), '');
          }

          if (typeof chainId === 'number') {
            selectedChainState.set(getChainNameFromId(parseInt(chainId.toString())));
          }

          if (typeof chainId === 'string') {
            selectedChainState.set(getChainNameFromId(parseInt(chainId)));
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
            selectedChain.set(null);
            unsupportedNetwork.set(true);
          } else {
            chain && getNotificationService().warn(chain, 'Wallet', getText('errorConnectingWallet', language), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, active, activate, deactivate, setWalletData, unsupportedNetwork],
  );

  const onWalletConnectSelected = useCallback(
    (showWalletConnectedNotification: boolean, lastSelectedWallet?: UserWallet) => {
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

        let chainId: string | number;
        let chain: Chain | undefined;
        try {
          await activate(walletConnector, undefined, true);
          getStorageService().set(WALLET_KEY, 'WalletConnect');
          setSelectedWallet('WalletConnect');

          chainId = await walletConnector.getChainId();
          chain = chainIdToChainName(chainId.toString());

          if (showWalletConnectedNotification && chain) {
            getNotificationService().notify(chain, 'Wallet', getText('walletConnectConnected', language), '');
          }

          if (typeof chainId === 'number') {
            selectedChainState.set(getChainNameFromId(parseInt(chainId.toString())));
          }

          if (typeof chainId === 'string') {
            selectedChainState.set(getChainNameFromId(parseInt(chainId)));
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
            selectedChain.set(null);
            unsupportedNetwork.set(true);
          } else {
            chain && getNotificationService().warn(chain, 'Wallet', getText('errorConnectingWallet', language), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    [language, active, activate, deactivate, setWalletData, selectedChain, unsupportedNetwork],
  );

  const onCloseWalletSelector = useCallback(
    (value: UserWallet | null) => {
      if (setUserSettings) {
        setUserSettings(prevState => ({ ...prevState, openWalletSelector: false }));
      }

      if (value) {
        setSelectedWallet(value);

        const lastSelectedWallet = getStorageService().get(WALLET_KEY) as UserWallet;
        if (value === 'MetaMask') {
          onMetaMaskSelected(true, lastSelectedWallet);
        } else if (value === 'WalletConnect') {
          onWalletConnectSelected(true, lastSelectedWallet);
        }
      }
    },
    [onMetaMaskSelected, onWalletConnectSelected, setUserSettings],
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
            selectedChain.set(null);
            unsupportedNetwork.set(true);
            return;
          }
          if (authorized) {
            await activate(injectedConnector, undefined, true);
            setSelectedWallet('MetaMask');

            if (typeof chainId === 'string') {
              selectedChainState.set(getChainNameFromId(parseInt(chainId)));
            }
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

      // Try to activate existing wallet connect session
      try {
        await walletConnector.activate();
      } catch (error) {
        selectedChain.set(null);

        setWalletData &&
          setWalletData(previousData => ({
            ...previousData,
            userWalletConnected: false,
          }));

        return;
      }

      // Check if session is authorized
      const authorized = walletConnector.walletConnectProvider.connected;

      const chainId = await walletConnector.getChainId();

      // User has connected wallet, but currently selected network in user wallet is not supported.
      if (typeof chainId === 'number' && !supportedChainIds.includes(chainId)) {
        selectedChain.set(null);
        unsupportedNetwork.set(true);
        return;
      }

      // User has connected wallet, but currently selected network in user wallet is not supported.
      if (typeof chainId === 'string' && !supportedChainIds.includes(parseInt(chainId))) {
        selectedChain.set(null);
        unsupportedNetwork.set(true);
        return;
      }
      if (authorized) {
        await activate(walletConnector, undefined, true);
        setSelectedWallet('WalletConnect');

        if (typeof chainId === 'number') {
          selectedChainState.set(getChainNameFromId(chainId));
        }

        if (typeof chainId === 'string') {
          selectedChainState.set(getChainNameFromId(parseInt(chainId)));
        }
      } else {
        setSelectedWallet(null);
      }
      setWalletData &&
        setWalletData(previousData => ({
          ...previousData,
          userWalletConnected: authorized,
        }));
    };

    if (!active) {
      const lastSelectedWallet = getStorageService().get(WALLET_KEY) as UserWallet;
      if (lastSelectedWallet === 'WalletConnect') {
        checkWalletConnectConnection();
      } else {
        checkMetaMaskConnection();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const lastSelectedWallet = getStorageService().get(WALLET_KEY) as UserWallet;
    if (selectedWallet === 'MetaMask') {
      onMetaMaskSelected(false, lastSelectedWallet);
    } else if (selectedWallet === 'WalletConnect') {
      onWalletConnectSelected(false, lastSelectedWallet);
    }
  }, [selectedWallet, active, onMetaMaskSelected, onWalletConnectSelected]);

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
      <ChainSelectorPopup
        open={chainSelectorOpen}
        onClose={onCloseChainSelector}
        requestNetworkChange={requestNetworkChange}
        requestAddNetwork={requestAddNetwork}
      />
      <div className="tc__navBar__wallet">
        {/* Wallet is connecting - show progress circle */}
        {connecting && <CircularProgress size={18} />}

        {/* Wallet not connected - show connect wallet button */}
        {!connecting && !selectedWallet && !isUnsupportedNetwork && (
          <div className="tc__connect-wallet-button" onClick={onSelectWallet}>
            <Typography variant="button-text">{getText('connectWallet', language)}</Typography>
          </div>
        )}

        {/* Wallet connected - show wallet info */}
        {!connecting &&
          selectedWallet &&
          active &&
          formattedPrimaryTokenBalance &&
          selectedChainName &&
          !isUnsupportedNetwork && (
            <>
              <div className="tc__connect-wallet-network-picker" onClick={onOpenChainSelector}>
                <TokenIcon
                  ticker={chainToTicker(selectedChainName)}
                  width={24}
                  height={24}
                  // TODO - Clean up during TokenIcon refactor
                  // 1. Remove small/large icons - we only need one size
                  // 2. Store original svg size for each icon
                  // 3. Use original size for svg viewport size
                  // 4. Set desired width and height for UI
                  vectorWidth={selectedChainName === 'ethereum' ? 20 : 24}
                  vectorHeight={selectedChainName === 'ethereum' ? 20 : 24}
                />
              </div>
              <div className="tc__connect-wallet-button" onClick={onOpenWalletPopup} ref={walletPopupAnchor}>
                <WalletAvatar avatar={ensAvatar} name={ensName || account} />

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
            </>
          )}

        {/* Wallet connected - but unsupported network */}
        {!connecting && isUnsupportedNetwork && (
          <InfoTooltip content={<WalletUnsupportedTooltip onClickSwitchNetwork={onClickUnsupportedNetworkButton} />}>
            <div className="tc__connect-wallet-network-picker">
              <WarnIcon />
            </div>
            <div className="tc__connect-wallet-button" ref={unsupportedNetworkRef}>
              <Typography variant="button-text">{getText('unsupported', language)}</Typography>
            </div>
          </InfoTooltip>
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
