import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { Networks } from '../state/NetworkState';
import { getNetworkConfig } from '../utils/getConfig';

let defaultProviders = new Map<Networks, JsonRpcProvider>();
const getDefaultProvider = (network: Networks) => {
  if (!defaultProviders.get(network)) {
    const config = getNetworkConfig(network);

    if (config.networkName === 'localhost') {
      defaultProviders.set(network, new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'unknown' }));
    } else if (config.networkName === 'homestead') {
      try {
        defaultProviders.set(network, new AlchemyProvider(config.networkName, config.alchemyKey));
      } catch (error) {
        console.error('getDefaultProvider - Alchemy not available', error);
      }
    } else if (config.networkName === 'fantom-mainnet') {
      defaultProviders.set(
        network,
        new JsonRpcProvider('https://rpc.ftm.tools/', { chainId: 250, name: 'Fantom Opera' }),
      );
    }
  }

  const provider = defaultProviders.get(network);
  if (!provider) {
    throw new Error(`Failed to get default provider for ${network} network!`);
  }
  return provider;
};

export default getDefaultProvider;
