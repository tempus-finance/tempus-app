import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers } from 'ethers';
import {
  CONSTANTS,
  Chain,
  NumberUtils,
  chainIdToChainName,
  chainToTicker,
  getStorageService,
  shortenAccount,
} from 'tempus-core-services';
import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { UserRejectedRequestError, WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { CircularProgress } from '@material-ui/core';
import { LocaleContext } from '../../context/localeContext';
import { TokenBalanceContext } from '../../context/tokenBalanceContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import { getChainConfig } from '../../utils/getConfig';
import { unsupportedNetworkState } from '../../state/ChainState';
import UserWallet from '../../interfaces/UserWallet';
import getText from '../../localisation/getText';
import useENS from '../../hooks/useENS';
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
import Button from '../common/Button';

import './Wallet.scss';

const { supportedChainIds, NETWORK_URLS } = CONSTANTS;
const WALLET_KEY = 'lastConnectedWallet';

const Wallet = () => {
  const { account, activate, deactivate, active, library } = useWeb3React<Web3Provider>();

  const { locale } = useContext(LocaleContext);
  const { tokenBalance } = useContext(TokenBalanceContext);
  const { userWalletChain, setWalletData } = useContext(WalletContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);
  const { setUserSettings } = useContext(UserSettingsContext);
  const navigate = useNavigate();

  const unsupportedNetwork = useHookState(unsupportedNetworkState);

  const isUnsupportedNetwork = unsupportedNetwork.attach(Downgraded).get();

  const walletPopupAnchor = useRef<HTMLButtonElement>(null);

  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [availableWallets, setAvailableWallets] = useState<{ [w in UserWallet]?: boolean }>({
    WalletConnect: true,
  });
  const [connecting, setConnecting] = useState<boolean>(false);
  const [chainSelectorOpen, setChainSelectorOpen] = useState<boolean>(false);
  const [unsupportedNetworkOpen, setUnsupportedNetworkOpen] = useState<boolean>(false);

  const onOpenChainSelector = useCallback(() => {
    setChainSelectorOpen(true);
    setUnsupportedNetworkOpen(false);
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

  const onUnsupportedNetworkToggle = useCallback(
    () => setUnsupportedNetworkOpen(prevState => !prevState),
    [setUnsupportedNetworkOpen],
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    const subscribeToNetworkChanges = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();

      provider.on('networkChanged', (chainId: string) => {
        const selected = chainIdToChainName(parseInt(chainId, 10));
        if (selected) {
          unsupportedNetwork.set(false);
        } else {
          unsupportedNetwork.set(true);
          // TODO: a temp soln to redirect to dashboard when user switch to a unsupported network+            setWalletData &&
          setWalletData &&
            setWalletData(previousData => ({
              ...previousData,
              userWalletChain: null,
            }));
          navigate('/', { replace: true });
        }
      });
    };
    subscribeToNetworkChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, setWalletData]);

  /**
   * Subscribe to account change events.
   */
  useEffect(() => {
    if (!active) {
      return;
    }

    const subscribeToAccountChanges = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      const provider = await injectedConnector.getProvider();

      provider.on('accountsChanged', (accountsList: string[]) => {
        // In case list of accounts is zero that means user disconnected all of his wallets,
        // and we should revert wallet connect button to initial state
        if (accountsList.length === 0) {
          setConnecting(false);
          setSelectedWallet(null);
          getStorageService().delete(WALLET_KEY);

          setWalletData &&
            setWalletData(() => ({
              userWalletConnected: false,
              userWalletSigner: null,
              userWalletAddress: '',
              userWalletChain: null,
            }));

          unsupportedNetwork.set(null);
        }
      });
    };
    subscribeToAccountChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, setWalletData]);

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
      const chain = chainIdToChainName(parseInt(chainId, 10));

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
          chain && getNotificationService().notify(chain, 'Wallet', getText('metamaskConnected', locale), '');
        }

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
              getText('changeNetworkRejected', locale),
              getText('changeNetworkRejectedExplain', locale),
            );
          // Network we tried to switch to is not yet added to MetaMask
        } else if ((error as any).code === 4902) {
          throw new Error('Unknown Network');
        } else {
          chain &&
            getNotificationService().warn(
              chain,
              'Wallet',
              getText('unsupportedNetwork', locale),
              getText('unsupportedNetworkExplain', locale),
            );
        }

        // User rejected network change request - return false
        return false;
      }
    },
    [locale, activate],
  );

  const onMetaMaskSelected = useCallback(
    (showWalletConnectedNotification: boolean, lastSelectedWallet?: UserWallet, forceActivate?: boolean) => {
      const connect = async (lastSelectedWallet?: UserWallet) => {
        if (!forceActivate && active && lastSelectedWallet === 'MetaMask') {
          setConnecting(false);
          return;
        }

        if (active) {
          deactivate();
        }
        const injectedConnector = new InjectedConnector({ supportedChainIds });
        const chainId = await injectedConnector.getChainId();
        const parsedChainId = typeof chainId === 'number' ? chainId : parseInt(chainId, 10);
        const chain = chainIdToChainName(parsedChainId);
        try {
          await activate(injectedConnector, undefined, true);
          getStorageService().set(WALLET_KEY, 'MetaMask');
          setSelectedWallet('MetaMask');
          if (showWalletConnectedNotification && chain) {
            getNotificationService().notify(chain, 'Wallet', getText('metamaskConnected', locale), '');
          }
        } catch (error) {
          setSelectedWallet(null);
          console.error('onMetaMaskSelected', error);
          if (error instanceof UnsupportedChainIdError) {
            unsupportedNetwork.set(true);
          } else {
            chain && getNotificationService().warn(chain, 'Wallet', getText('errorConnectingWallet', locale), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    [locale, active, activate, deactivate, unsupportedNetwork],
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

          // Hack to force correct chainId RPC
          const walletConnectorValid = new WalletConnectConnector({
            supportedChainIds: [...supportedChainIds],
            rpc: NETWORK_URLS,
            qrcode: true,
            chainId: Number(await walletConnector.getChainId()),
          });

          if (active) {
            deactivate();
          }

          await activate(walletConnectorValid, undefined, true);
          // End hack

          getStorageService().set(WALLET_KEY, 'WalletConnect');
          setSelectedWallet('WalletConnect');

          chainId = await walletConnectorValid.getChainId();
          const parsedChainId = typeof chainId === 'number' ? chainId : parseInt(chainId, 10);
          chain = chainIdToChainName(parsedChainId);

          if (showWalletConnectedNotification && chain) {
            getNotificationService().notify(chain, 'Wallet', getText('walletConnectConnected', locale), '');
          }
        } catch (error) {
          if (error instanceof UserRejectedRequestError) {
            setConnecting(false);
            setSelectedWallet(null);
            return;
          }

          if (lastSelectedWallet === 'MetaMask') {
            setSelectedWallet('MetaMask');
            const forceActivate = true;
            onMetaMaskSelected(false, lastSelectedWallet, forceActivate);
          }
          console.error('onWalletConnectSelected', error);
          if (error instanceof UnsupportedChainIdError) {
            unsupportedNetwork.set(true);
          } else {
            chain && getNotificationService().warn(chain, 'Wallet', getText('errorConnectingWallet', locale), '');
          }
        }
        setConnecting(false);
      };

      setConnecting(true);
      connect(lastSelectedWallet);
    },
    [locale, active, activate, deactivate, unsupportedNetwork, onMetaMaskSelected],
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
            unsupportedNetwork.set(true);
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

      // Try to activate existing wallet connect session
      try {
        await walletConnector.activate();
      } catch (error) {
        return;
      }

      if (!walletConnector || !walletConnector.walletConnectProvider) {
        return;
      }

      // Check if session is authorized
      const authorized = walletConnector.walletConnectProvider.connected;
      if (authorized) {
        await activate(walletConnector, undefined, true);

        // Hack to force correct chainId RPC
        const walletConnectorValid = new WalletConnectConnector({
          supportedChainIds: [...supportedChainIds],
          rpc: NETWORK_URLS,
          qrcode: true,
          chainId: Number(await walletConnector.getChainId()),
        });

        if (active) {
          deactivate();
        }

        await activate(walletConnectorValid, undefined, true);
        // End hack

        setSelectedWallet('WalletConnect');
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
    const updateWalletData = async () => {
      if (!library) {
        return;
      }
      const signer = library.getSigner();

      await signer.provider.ready;

      const rpcUrl = (NETWORK_URLS as any)[signer.provider.network.chainId];

      const walletConnectProvider = (signer?.provider as any)?.provider;

      // Invalid RPC Url
      if (walletConnectProvider && walletConnectProvider.isWalletConnect && rpcUrl !== walletConnectProvider.rpcUrl) {
        return;
      }

      const chain = chainIdToChainName(signer.provider.network.chainId);
      if (!chain) {
        unsupportedNetwork.set(true);
      }

      setWalletData &&
        setWalletData(() => ({
          userWalletConnected: Boolean(signer),
          userWalletSigner: signer || null,
          userWalletAddress: account || '',
          userWalletChain: chain || null,
        }));
    };
    updateWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Button className="tc__connect-wallet-button" onClick={onSelectWallet}>
            <Typography variant="button-text">{getText('connectWallet', locale)}</Typography>
          </Button>
        )}

        {/* Wallet connected - show wallet info */}
        {!connecting &&
          selectedWallet &&
          active &&
          formattedPrimaryTokenBalance &&
          userWalletChain &&
          !isUnsupportedNetwork && (
            <>
              <Button className="tc__connect-wallet-network-picker" onClick={onOpenChainSelector}>
                <TokenIcon
                  ticker={chainToTicker(userWalletChain)}
                  width={24}
                  height={24}
                  // TODO - Clean up during TokenIcon refactor
                  // 1. Remove small/large icons - we only need one size
                  // 2. Store original svg size for each icon
                  // 3. Use original size for svg viewport size
                  // 4. Set desired width and height for UI
                  vectorWidth={userWalletChain === 'ethereum' || userWalletChain === 'ethereum-fork' ? 20 : 24}
                  vectorHeight={userWalletChain === 'ethereum' || userWalletChain === 'ethereum-fork' ? 20 : 24}
                />
              </Button>
              <Button className="tc__connect-wallet-button" onClick={onOpenWalletPopup} ref={walletPopupAnchor}>
                <WalletAvatar avatar={ensAvatar} name={ensName || account} />

                <Spacer size={8} />

                {/* In case there are no pending transactions, show wallet address or ENS name if it's available */}
                {pendingTransactions.length === 0 && (
                  <div className="tc__connect-wallet-button__info">
                    <Typography variant="wallet-info">{ensName || shortenedAccount}</Typography>
                    <div className="tc__connect-wallet-button__balance">
                      <Typography variant="wallet-info-bold">{formattedPrimaryTokenBalance}</Typography>
                      <Spacer size={8} />
                      <Typography variant="wallet-info">{getChainConfig(userWalletChain).nativeToken}</Typography>
                    </div>
                  </div>
                )}

                {/* In case there are pending transactions, show number of pending transactions */}
                {pendingTransactions.length > 0 && (
                  <>
                    <Typography variant="h5">
                      {getText('xxxPending', locale, { count: pendingTransactions.length })}
                    </Typography>
                    <Spacer size={8} />
                    <CircularProgress size={16} color="inherit" />
                  </>
                )}
              </Button>
            </>
          )}

        {/* Wallet connected - but unsupported network */}
        {!connecting && isUnsupportedNetwork && (
          <InfoTooltip
            content={<WalletUnsupportedTooltip onClickSwitchNetwork={onOpenChainSelector} />}
            useExternalOpenState
            externalOpen={unsupportedNetworkOpen}
            onExternalToggle={onUnsupportedNetworkToggle}
          >
            <div className="tc__connect-wallet-network-picker">
              <WarnIcon />
            </div>
            <div className="tc__connect-wallet-button">
              <Typography variant="button-text">{getText('unsupported', locale)}</Typography>
            </div>
          </InfoTooltip>
        )}
      </div>
      {userWalletChain && (
        <WalletPopup
          anchorElement={walletPopupAnchor}
          account={account}
          chainName={userWalletChain}
          onSwitchWallet={onSwitchWallet}
          onClose={onCloseWalletPopup}
        />
      )}
    </>
  );
};

export default Wallet;
