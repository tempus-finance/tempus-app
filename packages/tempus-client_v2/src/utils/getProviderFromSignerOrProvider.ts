import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export default function getProviderFromSignerOrProvider(
  signerOrProvider: JsonRpcSigner | JsonRpcProvider,
): JsonRpcProvider {
  if (signerOrProvider instanceof JsonRpcSigner) {
    return signerOrProvider.provider;
  } else {
    return signerOrProvider;
  }
}
