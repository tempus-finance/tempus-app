import { Contract } from 'ethers';
import { Stats as StatsV2 } from '../abi/StatsTypingsV2';
import StatsV2ABI from '../abi/StatsV2ABI.json';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';
import { getDefaultProvider } from '../services';

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
    backingTokenPrecision: number,
    yieldBearingTokenPrecision: number,
    capitalsPrecision: number,
    yieldsPrecision: number,
    lpPrecision: number,
    threshold: Decimal,
    isBackingToken: boolean,
  ): Promise<{
    tokenAmount: Decimal;
    principalsStaked: Decimal;
    yieldsStaked: Decimal;
    principalsRate: Decimal;
    yieldsRate: Decimal;
  }> {
    const estimate = await this.contract.estimateExitAndRedeem(
      ammAddress,
      lpBalance.toBigNumber(lpPrecision),
      capitalsBalance.toBigNumber(capitalsPrecision),
      yieldsBalance.toBigNumber(yieldsPrecision),
      threshold.toBigNumber(capitalsPrecision),
      isBackingToken,
    );

    return {
      tokenAmount: new Decimal(
        estimate.tokenAmount,
        isBackingToken ? backingTokenPrecision : yieldBearingTokenPrecision,
      ),
      principalsStaked: new Decimal(estimate.principalsStaked, capitalsPrecision),
      yieldsStaked: new Decimal(estimate.yieldsStaked, yieldsPrecision),
      principalsRate: new Decimal(estimate.principalsRate, capitalsPrecision),
      yieldsRate: new Decimal(estimate.yieldsRate, yieldsPrecision),
    };
  }
}
