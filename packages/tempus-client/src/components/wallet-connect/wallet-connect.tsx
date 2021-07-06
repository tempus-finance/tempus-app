import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    // 1, // Mainnet - commented out just to avoid connecting to it by accident - enable when we go on mainnet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli 31337
    42, // Kovan
    1337 // Local
  ],
})

function WalletConnect(): JSX.Element {
  const { account, activate, active } = useWeb3React<Web3Provider>();

  const onConnect = () => {
    activate(injectedConnector);
  }

  return (
    <>
      {/* In case user did not connect wallet yer, show connect wallet option */}
      {!active &&
      <p className='header-action' onClick={onConnect}>
        CONNECT WALLET
      </p>}

      {/* If use connected a wallet, show wallet address */}
      {active &&
      <p className='header-action'>
        {account?.substring(0, 6)}...{account?.substring(account.length - 5, account.length)}
      </p>}
    </>
  );
}
export default WalletConnect;
