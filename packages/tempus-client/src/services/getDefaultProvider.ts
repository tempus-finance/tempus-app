// External libraries
import { JsonRpcProvider } from '@ethersproject/providers';

// Config
import config from '../config';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    defaultProvider = new JsonRpcProvider(config.networkUrl, { chainId: 31337, name: 'localhost' });
  }

  return defaultProvider;
};

export default getDefaultProvider;
