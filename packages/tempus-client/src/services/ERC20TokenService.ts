import { BigNumber, Contract, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces';
import { ZERO_ETH_ADDRESS } from '../constants';

type ERC20TokenServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof ERC20ABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class ERC20TokenService {
  private contract: ERC20 | null = null;

  init(params: ERC20TokenServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as ERC20;
  }

  async balanceOf(address: string): Promise<BigNumber> {
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

  async symbol(): Promise<Ticker> {
    if (!this.contract) {
      console.error('ERC20TokenService - symbol() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    let ticker: Ticker;
    try {
      // ETH is a native token that does not have an ERC20 contract, we need to return token ticker like this.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        return 'ETH';
      }

      ticker = (await this.contract.symbol()) as Ticker;
    } catch (error) {
      console.error('ERC20TokenService - symbol() - Failed to get token ticker!');
      return Promise.reject();
    }
    return ticker;
  }

  async getAllowance(ownerAddress: string, spenderAddress: string): Promise<BigNumber> {
    if (!this.contract) {
      console.error('ERC20TokenService - getAllowance() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    try {
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        this.contract.provider.getBalance(ownerAddress);
      }

      return await this.contract.allowance(ownerAddress, spenderAddress);
    } catch (error) {
      console.error('ERC20TokenService - getAllowance() - Getting allowance failed!', error);
      return Promise.reject(error);
    }
  }

  async approve(spenderAddress: string, amount: BigNumber): Promise<ContractTransaction | void> {
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

  async totalSupply(): Promise<BigNumber> {
    if (!this.contract) {
      console.error('ERC20TokenService - approve() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.contract.totalSupply();
    } catch (error) {
      console.error('ERC20TokenService - totalSupply() - Failed to get token total supply!', error);
      return Promise.reject(error);
    }
  }
}
export default ERC20TokenService;
