import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { ChainConfig, Chain } from '../interfaces';

let defaultProviders = new Map<Chain, JsonRpcProvider>();
export const getDefaultProvider = (chain: Chain, getChainConfig: (chain: Chain) => ChainConfig) => {
  if (!defaultProviders.get(chain)) {
    const config = getChainConfig(chain);

    if (config.networkName === 'localhost') {
      defaultProviders.set(chain, new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'unknown' }));
    } else if (config.networkName === 'homestead') {
      try {
        defaultProviders.set(chain, new AlchemyProvider(config.networkName, config.alchemyKey));
      } catch (error) {
        console.error('getDefaultProvider - Alchemy not available', error);
      }
    } else if (config.networkName === 'fantom-mainnet') {
      defaultProviders.set(
        chain,
        new JsonRpcProvider(config.privateNetworkUrl, { chainId: 250, name: 'Fantom Opera' }),
      );
    }
  }

  const provider = defaultProviders.get(chain);
  if (!provider) {
    throw new Error(`Failed to get default provider for ${chain} chain!`);
  }
  return provider;
};
