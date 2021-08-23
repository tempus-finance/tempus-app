import { FC, useCallback, useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Button from '@material-ui/core/Button';
import shortenAccount from '../../utils/shorten-account';
import { useAppDispatch } from '../../state/hooks';
import { setUserWalletAddress } from '../../state/slices/user-wallet-slice';

const WalletConnect: FC = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const [hasBeenClicked, setHasBeenClicked] = useState<boolean>(false);
  const { account, activate, active } = useWeb3React<Web3Provider>();

  const onConnect = useCallback(() => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      activate(injectedConnector);
    }
  }, [hasBeenClicked, setHasBeenClicked, activate]);

  useEffect(() => {
    dispatch(setUserWalletAddress(account || ''));
  }, [dispatch, account]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = shortenAccount(account);
  }

  return active ? (
    <span className="tf__header__action tf__header__action-account" title={String(account)}>
      <AccountBalanceWalletIcon />
      {shortenedAccount}
    </span>
  ) : (
    <Button
      title={CONNECT_WALLET}
      variant="contained"
      size="small"
      className="tf__header__action tf__header__action-wallet"
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

// Example contract communication with typings
/*
// Make sure to import Contract from 'ethers' library
const contract = new Contract(
  // This is the address of the contract
  '0x039557b8f8f53d863f534C4dFF01d8A3467d26A0',
  // Import ABI JSON file from 'abi/TempusToken.json'.
  // ABI JSON for TempusToken is generated when you run 'npm run start-local' in tempus-protocol repository inside tempus-protocol/abi-artifacts.
  TempusTokenABI,
  library?.getSigner(),
// TempusToken is a typings file generated when running 'npm run start-local' in tempus-protocol repository inside tempus-protocol/typechain.
) as TempusToken;

// Call an example function from contract - notice that we now have full contract typings and error checking because of typings file.
contract.balanceOf(account);
*/
