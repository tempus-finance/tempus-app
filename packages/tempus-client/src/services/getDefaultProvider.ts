import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import getConfig from '../utils/get-config';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    const config = getConfig();

    if (config.networkName === 'localhost') {
      defaultProvider = new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'unknown' });
    } else {
      defaultProvider = new AlchemyProvider(config.networkName, config.alchemyKey);
    }
  }

  return defaultProvider;
};

export default getDefaultProvider;
