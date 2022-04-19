import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import ERC20TokenABI from '../abi/ERC20';
import { ChainConfig, Chain } from '../interfaces';
import { getDefaultProvider } from './getDefaultProvider';
import { ERC20TokenService } from './ERC20TokenService';

const ERC20TokenServiceMap: Map<string, ERC20TokenService> = new Map();
export const getERC20TokenService = (
  address: string,
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): ERC20TokenService => {
  if (!ERC20TokenServiceMap.get(address)) {
    const tokenService = new ERC20TokenService();
    tokenService.init({
      ERC20Contract: Contract,
      address,
      abi: ERC20TokenABI,
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
    });

    ERC20TokenServiceMap.set(address, tokenService);
  }

  if (signerOrProvider) {
    const tokenService = ERC20TokenServiceMap.get(address);

    if (tokenService?.contract?.signer !== signerOrProvider && tokenService?.contract?.provider !== signerOrProvider) {
      tokenService?.init({
        ERC20Contract: Contract,
        address,
        abi: ERC20TokenABI,
        signerOrProvider,
      });
    }
  }

  const service = ERC20TokenServiceMap.get(address);
  if (!service) {
    throw new Error(`Failed to get ERC20 Token service for address ${address}`);
  }
  return service;
};
