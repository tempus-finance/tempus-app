import { InfuraProvider, JsonRpcProvider } from '@ethersproject/providers';
import getConfig from '../utils/get-config';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    defaultProvider = new InfuraProvider(getConfig().networkName, getConfig().infuraKey);
  }

  return defaultProvider;
};

export default getDefaultProvider;
