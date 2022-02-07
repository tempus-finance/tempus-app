import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Chain } from '../interfaces/Chain';
import getDefaultProvider from '../services/getDefaultProvider';

export default function getProvider(chain: Chain, userWalletSigner: JsonRpcSigner | null): JsonRpcProvider {
  if (userWalletSigner) {
    return userWalletSigner.provider;
  }

  return getDefaultProvider(chain);
}
