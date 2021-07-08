import { FC } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const WalletConnect: FC = (): JSX.Element => {
  const { account, activate, active } = useWeb3React<Web3Provider>();

  const onConnect = () => {
    if (!active) {
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      activate(injectedConnector);
    }
  };

  let shortenedAccount;
  if (account) {
    shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 5, account.length)}`;
  }

  return (
    <p className="header-action" onClick={onConnect}>
      {active ? shortenedAccount : CONNECT_WALLET}
    </p>
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
