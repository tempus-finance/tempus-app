import { BigNumber, Contract, ContractTransaction, CallOverrides } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import ERC20ABI, { ERC20 } from '../abi/ERC20.json';
import { TypedListener } from '../abi/commons';
import { approveGasIncrease, ZERO_ETH_ADDRESS } from '../constants';
import { Ticker } from '../interfaces';

export type TransferEventListener = TypedListener<
  [string, string, BigNumber],
  {
    from: string;
    to: string;
    value: BigNumber;
  }
>;

type ERC20TokenServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof ERC20ABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

export class ERC20TokenService {
  public contract: ERC20 | null = null;

  init(params: ERC20TokenServiceParameters): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }

    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as ERC20;
  }

  async balanceOf(address: string, overrides?: CallOverrides): Promise<BigNumber> {
    if (!this.contract) {
      console.error('ERC20TokenService - balanceOf() - Attempted to use ERC20TokenService before initializing it!');
      return Promise.reject();
    }

    let balance: BigNumber;
    try {
      // ETH is a native token that does not have an ERC20 contract, we need to get balance for it like this.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        if (overrides) {
          return await this.contract.provider.getBalance(address, overrides.blockTag);
        }
        return await this.contract.provider.getBalance(address);
      }

      if (overrides) {
        balance = await this.contract.balanceOf(address, overrides);
      } else {
        balance = await this.contract.balanceOf(address);
      }
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
        return await Promise.resolve();
      }

      const estimate = await this.contract.estimateGas.approve(spenderAddress, amount);
      approveTransaction = await this.contract.approve(spenderAddress, amount, {
        gasLimit: Math.ceil(estimate.toNumber() * approveGasIncrease),
      });
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

  onTransfer(from: string | null, to: string | null, listener: TransferEventListener): void {
    if (this.contract) {
      // In case of ETH trigger transfer event on every new block
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        this.contract.provider.on('block', listener);
      } else {
        this.contract.on(this.contract.filters.Transfer(from, to), listener);
      }
    }
  }

  offTransfer(from: string | null, to: string | null, listener: TransferEventListener): void {
    if (this.contract) {
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        this.contract.provider.off('block', listener);
      } else {
        this.contract.off(this.contract.filters.Transfer(from, to), listener);
      }
    }
  }
}
