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

    if (getChainNameFromId(chainId) === chain) {
      return userWalletSigner.provider;
    }
  }

  return getDefaultProvider(chain);
}
