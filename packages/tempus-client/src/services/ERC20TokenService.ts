import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces';

type ERC20TokenServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof ERC20ABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class ERC20TokenService {
  private contract: ERC20 | null = null;

  public init(params: ERC20TokenServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as ERC20;
  }

  public async symbol(): Promise<Ticker> {
    if (!this.contract) {
      console.error('ERC20TokenService - symbol() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    return (await this.contract.symbol()) as Ticker;
  }
}
export default ERC20TokenService;
