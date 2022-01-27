import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { Chain } from '../interfaces/Chain';
import { getChainConfig } from '../utils/getConfig';

let defaultProviders = new Map<Chain, JsonRpcProvider>();
const getDefaultProvider = (chain: Chain) => {
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
        new JsonRpcProvider('https://rpc.ftm.tools/', { chainId: 250, name: 'Fantom Opera' }),
      );
    }
  }

  const provider = defaultProviders.get(chain);
  if (!provider) {
    throw new Error(`Failed to get default provider for ${chain} network!`);
  }
  return provider;
};

export default getDefaultProvider;
