// External libraries
import { JsonRpcProvider } from '@ethersproject/providers';

// Config
import getConfig from '../utils/get-config';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    defaultProvider = new JsonRpcProvider(getConfig().networkUrl, { chainId: 31337, name: 'localhost' });
  }

  return defaultProvider;
};

export default getDefaultProvider;
