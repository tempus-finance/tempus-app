import { FC, useCallback, useState, useEffect, useContext, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
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
  // 1, // Mainnet
  // 3, // Ropsten
  // 4, // Rinkeby
  // 5, // Goerli 31337
  // 42, // Kovan
  1337, // Local
  31337, // AWS Private
];

const WalletConnect: FC = (): JSX.Element => {
  const { setData } = useContext(Context);

  const [userEthBalance, setUserEthBalance] = useState<BigNumber>(BigNumber.from('0'));
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const onConnect = useCallback(() => {
    if (!active) {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      activate(injectedConnector)
        .then(() => {
          getNotificationService().notify('Wallet connected', '');
        })
        .catch(() => {
          getNotificationService().warn('Error connecting wallet', '');
        });
    }
  }, [active, activate]);

  useEffect(() => {
    const checkConnection = async () => {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      injectedConnector.isAuthorized().then((authorized: boolean | null) => {
        if (authorized) {
          activate(injectedConnector);
        }
      });
    };
    if (!active) {
      checkConnection();
    }
  }, [active, activate]);

  useEffect(() => {
    setData &&
      setData(previousData => ({
        ...previousData,
        userWalletSigner: library?.getSigner() || null,
        userWalletAddress: account || '',
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, library]);

  // Fetch number of ETH user has
  useEffect(() => {
    if (!account || !library) {
      return;
    }

    const fetchEthBalance = async () => {
      setUserEthBalance(await library.getBalance(account));
    };
    fetchEthBalance();
  }, [account, library]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  const formattedEthBalance = useMemo(() => {
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(userEthBalance), 2);
  }, [userEthBalance]);

  return (
    <div
      className="tf__connect__wallet-container"
      style={{
        cursor: active ? 'default' : 'pointer',
      }}
    >
      {active && (
        <>
          <Spacer size={15} />
          <Typography variant="h5">ETH {formattedEthBalance}</Typography>
          <Spacer size={10} />
        </>
      )}
      <div className="tf__connect__wallet-button" onClick={onConnect}>
        <AccountBalanceWalletIcon />
        <Spacer size={4} />
        <Typography variant="h5">{active ? shortenedAccount : CONNECT_WALLET}</Typography>
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
