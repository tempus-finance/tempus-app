import { CallOverrides, Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Decimal } from '../datastructures';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { getDefaultProvider } from '../services';

export class ERC20Contract {
  private contractAddress: string;
  private contract: ERC20;

  constructor(contractAddress: string, signer?: JsonRpcSigner) {
    this.contractAddress = contractAddress;

    this.contract = new Contract(this.contractAddress, ERC20ABI, signer) as ERC20;
  }

  /**
   * Checks balance of the ERC20 token for specified wallet address
   * @param address Address of the wallet.
   * @param overrides Ethers.js call overrides
   * @returns Balance of the token.
   */
  async balanceOf(address: string, overrides?: CallOverrides): Promise<Decimal> {
    let balance: Decimal;
    try {
      // ETH is a native token that does not have an ERC20 contract, we need to get balance for it like this.
      if (this.contract.address === ZERO_ETH_ADDRESS) {
        if (overrides) {
          return this.contract.provider.getBalance(address, overrides.blockTag);
        } else {
          return this.contract.provider.getBalance(address);
        }
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
}
