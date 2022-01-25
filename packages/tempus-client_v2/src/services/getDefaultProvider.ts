import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { selectedChainState } from '../state/ChainState';
import getConfig from '../utils/getConfig';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    const config = getConfig()[selectedChainState.get()];

    if (config.networkName === 'localhost') {
      defaultProvider = new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'unknown' });
    } else {
      try {
        defaultProvider = new AlchemyProvider(config.networkName, config.alchemyKey);
      } catch (error) {
        console.error('getDefaultProvider - Alchemy not available', error);
      }
    }
  }

  return defaultProvider;
};

export default getDefaultProvider;
