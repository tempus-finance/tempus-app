import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { ChainConfig } from '../interfaces';
import { Chain } from '../interfaces/Chain';
import { chainIdToChainName } from './chainUtils';

export async function getProvider(
  chain: Chain,
  userWalletSigner: JsonRpcSigner | null,
  getDefaultProvider: (chain: Chain, getChainConfig: (chain: Chain) => ChainConfig) => JsonRpcProvider,
  getChainConfig: (chain: Chain) => ChainConfig,
): Promise<JsonRpcProvider> {
  if (userWalletSigner) {
    const chainId = await userWalletSigner.getChainId();

    // In case we do not support currently selected chain in user wallet this will be null
    const userWalletChain = chainIdToChainName(chainId);
    if (userWalletChain === chain) {
      return userWalletSigner.provider;
    }
    return getDefaultProvider(chain, getChainConfig);
  }

  return getDefaultProvider(chain, getChainConfig);
}
