import { FC, useCallback, useEffect, useContext, useMemo } from 'react';
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
    if (!active) {
      checkConnection();
    }
  }, [active, activate, setData, requestNetworkChange]);

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
    </div>
  );
};

export default WalletConnect;

/*
*** Example TPS/TYS swap

// Get address of the TempusPool we want to make swap in and AMM for that tempus pool.
// We have one AMM per tempus pool.
const poolAddress = getConfig().tempusPools[0].address;
const poolAMMAddress = getConfig().tempusPools[0].ammAddress;

// Get required services for the swap. Initialize them using wallet signer.
const vaultService = getVaultService(library.getSigner());
const tempusAMMService = getTempusAMMService(library.getSigner());
const tempusPoolService = getTempusPoolService(library.getSigner());

// Get poolId from tempus AMM contract. PoolID is balancer internal ID for the pool, it's not same as pool address.
const poolId = await tempusAMMService.poolId(poolAMMAddress);

// Get address of the tokens we want to swap (TPS and TYS).
const yieldShareAddress = await tempusPoolService.getYieldTokenAddress(poolAddress);
const principalShareAddress = await tempusPoolService.getPrincipalsTokenAddress(poolAddress);

// Get TPS token service.
const principalShareService = getERC20TokenService(principalShareAddress, library.getSigner());

// We are giving 20 TPS in this swap for unknown amount of TYS (based on current exchange rate).
// In order to give 20 TPS we have to give approval to Vault contract for 20 TPS from user wallet.
const approveTransaction = await principalShareService.approve(
  getConfig().vaultContract,
  BigNumber.from(ethers.utils.parseEther('20')),
);
// Wait for approval transaction to finish.
await approveTransaction.wait();

// Make swap using Vault service, with all required parameters.
const swapTransaction = await vaultService.swap(
  poolId,
  SwapKind.GIVEN_IN,
  account,
  principalShareAddress,
  yieldShareAddress,
  20,
);

// Wait for swap event to finish.
await swapTransaction.wait();
*/
