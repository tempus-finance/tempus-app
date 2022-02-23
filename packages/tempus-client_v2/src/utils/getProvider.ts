import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Chain } from '../interfaces/Chain';
import getDefaultProvider from '../services/getDefaultProvider';
import getChainNameFromId from './getChainNameFromId';

export default async function getProvider(
  chain: Chain,
  userWalletSigner: JsonRpcSigner | null,
): Promise<JsonRpcProvider> {
  if (userWalletSigner) {
    const chainId = await userWalletSigner.getChainId();

    const userWalletChain = getChainNameFromId(chainId);
    // In case we do not support currently selected chain in user wallet this will be null
    if (!userWalletChain) {
      return getDefaultProvider(chain);
    } else if (userWalletChain === chain) {
      return userWalletSigner.provider;
    }
  }

  return getDefaultProvider(chain);
}
