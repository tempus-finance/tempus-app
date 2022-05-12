import { BigNumber, CallOverrides, Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20Typings';
import ERC20ABI from '../abi/ERC20.json';
import { Decimal, DEFAULT_DECIMAL_PRECISION, increasePrecision, decreasePrecision } from '../datastructures';
import { getDefaultProvider } from '../services';
import { Chain } from '../interfaces';

/**
 * ERC20 Contract class represents ERC20 Token contracts on chain and has same interface.
 * The only difference is that this contract class will always return Decimal instance
 * that has DEFAULT_DECIMAL_PRECISION instead of a BigNumber with unknown precision.
 */
export class ERC20Contract {
  private contractAddress: string;
  private contract: ERC20;

  constructor(chain: Chain, contractAddress: string, signer?: JsonRpcSigner) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, ERC20ABI, signer || provider) as ERC20;
  }

  /**
   * Checks balance of the ERC20 token for specified wallet address
   * @param walletAddress Address of the wallet.
   * @param overrides Ethers.js call overrides
   * @returns Balance of the token.
   */
  async balanceOf(walletAddress: string, overrides?: CallOverrides): Promise<Decimal> {
    let balance: BigNumber;
    try {
      if (overrides) {
        balance = await this.contract.balanceOf(walletAddress, overrides);
      } else {
        balance = await this.contract.balanceOf(walletAddress);
      }
    } catch (error) {
      console.error(
        `ERC20TokenService - balanceOf() - Failed to get balance of ${walletAddress}, token ${this.contractAddress}!`,
      );
      return Promise.reject(error);
    }

    // Convert balance (BigNumber) into a Decimal with proper precision
    const tokenDecimals = await this.decimals();
    if (tokenDecimals < 18) {
      return new Decimal(increasePrecision(balance, DEFAULT_DECIMAL_PRECISION - tokenDecimals));
    }
    if (tokenDecimals > 18) {
      return new Decimal(decreasePrecision(balance, tokenDecimals - DEFAULT_DECIMAL_PRECISION));
    }
    return new Decimal(balance);
  }

  async decimals(): Promise<number> {
    try {
      return await this.contract.decimals();
    } catch (error) {
      return Promise.reject(
        new Error(`ERC20Contract - decimals() - Failed to get number of decimals for token ${this.contractAddress}`),
      );
    }
  }
}
