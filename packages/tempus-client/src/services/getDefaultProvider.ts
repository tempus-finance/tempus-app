import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import getConfig from '../utils/get-config';

let defaultProvider: JsonRpcProvider;
const getDefaultProvider = () => {
  if (!defaultProvider) {
    defaultProvider = new AlchemyProvider(getConfig().networkName, getConfig().alchemyKey);
  }

  return defaultProvider;
};

export default getDefaultProvider;
