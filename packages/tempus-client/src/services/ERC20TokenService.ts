import { BigNumber, Contract, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces';
import { ZERO_ETH_ADDRESS } from '../constants';
import { symbolCache } from '../cache/ERC20TokenCache';

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

  public async balanceOf(address: string): Promise<BigNumber> {
    if (!this.contract) {
      console.error('ERC20TokenService - balanceOf() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    let balance: BigNumber;
    try {
      // ETH is a native token that does not have an ERC20 contract, we need to get balance for it like this.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        return this.contract.provider.getBalance(address);
      }

      balance = await this.contract.balanceOf(address);
    } catch (error) {
      console.error(`ERC20TokenService - balanceOf() - Failed to get balance of ${address}!`);
      return Promise.reject(error);
    }
    return balance;
  }

  public async symbol(): Promise<Ticker> {
    if (!this.contract) {
      console.error('ERC20TokenService - symbol() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    const cachedSymbolPromise = symbolCache.get(this.contract.address);
    if (cachedSymbolPromise) {
      return cachedSymbolPromise;
    }

    try {
      // ETH is a native token that does not have an ERC20 contract, we need to return token ticker like this.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        return 'ETH';
      }

      const tickerPromise = this.contract.symbol() as Promise<Ticker>;
      symbolCache.set(this.contract.address, tickerPromise);

      return tickerPromise;
    } catch (error) {
      console.error('ERC20TokenService - symbol() - Failed to get token ticker!');
      return Promise.reject();
    }
  }

  public async approve(spenderAddress: string, amount: BigNumber): Promise<ContractTransaction | void> {
    if (!this.contract) {
      console.error('ERC20TokenService - approve() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    let approveTransaction: ContractTransaction;
    try {
      // No need to approve ETH transfers, ETH is not an ERC20 contract.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        return Promise.resolve();
      }

      approveTransaction = await this.contract.approve(spenderAddress, amount);
    } catch (error) {
      console.log('ERC20TokenService - approve() - Approve transaction failed!', error);
      return Promise.reject(error);
    }
    return approveTransaction;
  }
}
export default ERC20TokenService;
