import { FC, useCallback, useState, useEffect, useContext } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Button from '@material-ui/core/Button';
import Typography from '../typography/Typography';
import shortenAccount from '../../utils/shorten-account';
import { Context } from '../../context';

const WalletConnect: FC = (): JSX.Element => {
  const { setData } = useContext(Context);

  const [hasBeenClicked, setHasBeenClicked] = useState<boolean>(false);
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const onConnect = useCallback(() => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      activate(injectedConnector);
    }
  }, [hasBeenClicked, setHasBeenClicked, activate]);

  useEffect(() => {
    setData &&
      setData({
        userWalletSigner: library?.getSigner() || null,
        userWalletAddress: account || '',
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, library]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  return active ? (
    <span className="tf__header__action tf__header__action-account" title={String(account)}>
      <AccountBalanceWalletIcon />
      <Typography color="default" variant="h3">
        {shortenedAccount}
      </Typography>
    </span>
  ) : (
    <Button
      title={CONNECT_WALLET}
      variant="contained"
      size="small"
      className="tf__header__action tf__header__action-wallet"
      disabled={hasBeenClicked}
      onClick={onConnect}
    >
      <AccountBalanceWalletIcon /> {CONNECT_WALLET}
    </Button>
  );
};

export default WalletConnect;

export const CONNECT_WALLET = 'CONNECT WALLET';

const supportedChainIds = [
  // 1, // Mainnet - commented out just to avoid connecting to it by accident - enable when we go on mainnet
  3, // Ropsten
  4, // Rinkeby
  5, // Goerli 31337
  42, // Kovan
  1337, // Local
  31337, // AWS Private
];

/*
*** Example deposit to TempusPool code snippet

// Get the tempus pool address we want to deposit to
const tempusPoolAddress = getConfig().tempusPools[0].address;

// Get tempus pool service - make sure to pass signer we get when user connects the wallet,
// you can get it from react context after user connects the wallet
const tempusPoolService = getTempusPoolService(library.getSigner());

// Get address of the token we want to deposit, in this example we want to deposit YBT but we can also deposit BT
const addressYBT = await tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress);

// Get ERC20 token service - make sure to pass signer we get when user connects the wallet
const serviceYBT = getERC20TokenService(addressYBT, library.getSigner());

// APPROVE BUTTON - First part of deposit is to approve specific amount of tokens - this will open MetaMask popup that asks user to confirm approval.
// This approve basically allows tempus pool contract to transfer amount of tokens from user wallet.
const approveTransaction = await serviceYBT.approve(tempusPoolAddress, ethers.utils.parseEther('100'));

// Transaction can take some time to finish (to get mined), make sure to wait for that to happen before going to next step.
await approveTransaction.wait();

// After approve transaction is finished, we can run deposit transaction - this will also open MetaMask popup that asks user to confirm transaction.
// Last parameter here is the address of the wallet we want to send TPS and TYS tokens to.
const depositTransaction = await tempusPoolService.deposit(tempusPoolAddress, ethers.utils.parseEther('100'), account);

// Again, wait for transaction to finish executing.
await depositTransaction?.wait();


// We need to add error handling when waiting for transaction to finish in case user runs out of gas, etc...
*/

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
const principalShareAddress = await tempusPoolService.getPrincipalTokenAddress(poolAddress);

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
