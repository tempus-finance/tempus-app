import { BigNumber, Contract } from 'ethers';
import { TempusPool as TempusPoolV1 } from '../abi/TempusPoolV1Typings';
import TempusPoolV1ABI from '../abi/TempusPoolV1ABI.json';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';
import { getDefaultProvider } from '../services/getDefaultProvider';

export class TempusPoolV1Contract {
  private contractAddress: string;
  private contract: TempusPoolV1;

  constructor(chain: Chain, contractAddress: string) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, TempusPoolV1ABI, provider) as TempusPoolV1;
  }

  async currentInterestRate(backingTokenPrecision: number): Promise<Decimal> {
    let currentInterestRate: BigNumber;
    try {
      currentInterestRate = await this.contract.currentInterestRate();
    } catch (error) {
      console.error(
        `TempusPoolV1Contract - currentInterestRate() - Failed to fetch current interest rate ${this.contractAddress}`,
        error,
      );
      return Promise.reject(error);
    }

    return new Decimal(currentInterestRate, backingTokenPrecision);
  }

  async initialInterestRate(backingTokenPrecision: number): Promise<Decimal> {
    let initialInterestRate: BigNumber;
    try {
      initialInterestRate = await this.contract.initialInterestRate();
    } catch (error) {
      console.error(
        `TempusPoolV1Contract - initialInterestRate() - Failed to fetch initial interest rate ${this.contractAddress}`,
        error,
      );
      return Promise.reject(error);
    }

    return new Decimal(initialInterestRate, backingTokenPrecision);
  }
}
