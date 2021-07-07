import { FC } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const WalletConnect: FC = (): JSX.Element => {
  const injectedConnector = new InjectedConnector({ supportedChainIds });

  const { account, activate, active } = useWeb3React<Web3Provider>();

  let shortenedAccount;
  if (account) {
    shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 5, account.length)}`;
  }

  const onConnect = () => {
    activate(injectedConnector);
  };

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
