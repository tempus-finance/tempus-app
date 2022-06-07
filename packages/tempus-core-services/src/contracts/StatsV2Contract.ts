import { Contract, getDefaultProvider } from 'ethers';
import { Stats as StatsV2 } from '../abi/StatsTypingsV2';
import StatsV2ABI from '../abi/StatsV2ABI.json';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';

export class StatsV2Contract {
  private contractAddress: string;
  private contract: StatsV2;

  constructor(chain: Chain, contractAddress: string) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, StatsV2ABI, provider) as StatsV2;
  }

  async estimateExitAndRedeem(
    ammAddress: string,
    capitalsBalance: Decimal,
    yieldsBalance: Decimal,
    lpBalance: Decimal,
    threshold: Decimal,
    isBackingToken: boolean,
  ): Promise<{
    tokenAmount: Decimal;
    principalsStaked: Decimal;
    yieldsStaked: Decimal;
    principalsRate: Decimal;
    yieldsRate: Decimal;
  }> {
    // TODO - Use proper precision for tokens (refactor precision handling in Decimal)
    const estimate = await this.contract.estimateExitAndRedeem(
      ammAddress,
      lpBalance.toBigNumber(),
      capitalsBalance.toBigNumber(),
      yieldsBalance.toBigNumber(),
      threshold.toBigNumber(),
      isBackingToken,
    );

    // TODO - Use proper precision for tokens (refactor precision handling in Decimal)
    return {
      tokenAmount: new Decimal(estimate.tokenAmount),
      principalsStaked: new Decimal(estimate.principalsStaked),
      yieldsStaked: new Decimal(estimate.yieldsStaked),
      principalsRate: new Decimal(estimate.principalsRate),
      yieldsRate: new Decimal(estimate.yieldsRate),
    };
  }
}
