import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export function getProviderFromSignerOrProvider(signerOrProvider: JsonRpcSigner | JsonRpcProvider): JsonRpcProvider {
  if (signerOrProvider instanceof JsonRpcSigner) {
    return signerOrProvider.provider;
  }
    return signerOrProvider;
}
