import { Web3Provider } from '@ethersproject/providers';

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;

  return library;
}
