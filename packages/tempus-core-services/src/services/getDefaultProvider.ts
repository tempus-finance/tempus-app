import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { Chain } from '../interfaces';

const defaultProviders = new Map<Chain, JsonRpcProvider>();
export const getDefaultProvider = (chain: Chain): JsonRpcProvider => {
  if (!defaultProviders.get(chain)) {
    try {
      if (chain === 'ethereum') {
        defaultProviders.set(chain, new AlchemyProvider('homestead', process.env.REACT_APP_MAINNET_ALCHEMY_KEY));
      } else if (chain === 'fantom') {
        defaultProviders.set(
          chain,
          new JsonRpcProvider(process.env.REACT_APP_FANTOM_RPC, { chainId: 250, name: 'Fantom Opera' }),
        );
      } else if (chain === 'ethereum-fork') {
        defaultProviders.set(
          chain,
          new JsonRpcProvider(process.env.REACT_APP_ETHEREUM_FORK_RPC, {
            chainId: 31337,
            name: 'Tempus Ethereum Fork',
          }),
        );
      }
    } catch (error) {
      console.error(`getDefaultProvider - Failed to get RPC provider for ${chain} chain!`, error);
    }
  }

  const provider = defaultProviders.get(chain);
  if (!provider) {
    throw new Error(`getDefaultProvider - Failed to get default provider for ${chain} chain!`);
  }
  return provider;
};
