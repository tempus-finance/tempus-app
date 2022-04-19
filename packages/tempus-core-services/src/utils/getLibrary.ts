import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers';

export function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc): Web3Provider {
  const library = new Web3Provider(provider, 'any');
  library.pollingInterval = 12000;

  return library;
}
