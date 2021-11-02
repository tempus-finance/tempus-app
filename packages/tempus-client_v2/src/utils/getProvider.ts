import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export default function getProvider(signerOrProvider: JsonRpcSigner | JsonRpcProvider): JsonRpcProvider {
  if (signerOrProvider instanceof JsonRpcSigner) {
    return signerOrProvider.provider;
  } else {
    return signerOrProvider;
  }
}
