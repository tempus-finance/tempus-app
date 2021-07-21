import { FC, useCallback, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

import { Typography } from '@material-ui/core';

import getContractService from '../../services/ContractService';

const WalletConnect: FC = (): JSX.Element => {
  const [hasBeenClicked, setHasBeenClicked] = useState<boolean>(false);
  const { account, activate, active, library } = useWeb3React<Web3Provider>();

  const onConnect = useCallback(() => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      const injectedConnector = new InjectedConnector({ supportedChainIds });
      activate(injectedConnector);
    }
  }, [hasBeenClicked, setHasBeenClicked, activate]);

  /**
   * Initialize contracts service with new signer when user connects a wallet.
   */
  useEffect(() => {
    if (!library) {
      return;
    }
    getContractService().init(library.getSigner());
  }, [library]);

  let shortenedAccount;
  if (account) {
    shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 5, account.length)}`;
  }

  return (
    <Typography className="header-action" onClick={onConnect} variant="button">
      {active ? shortenedAccount : CONNECT_WALLET}
    </Typography>
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
