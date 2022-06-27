import { TempusPoolV1Contract } from '../contracts/TempusPoolV1Contract';
import { Chain } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';

export class PoolInterestRateService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async isPoolInterestRateNegative(poolAddress: string): Promise<boolean> {
    const backingTokenPrecision = this.getPoolConfig(poolAddress).tokenPrecision.backingToken;

    const tempusPoolContract = new TempusPoolV1Contract(this.chain, poolAddress);

    const initialInterestRate = await tempusPoolContract.initialInterestRate(backingTokenPrecision);
    const currentInterestRate = await tempusPoolContract.currentInterestRate(backingTokenPrecision);

    return initialInterestRate.gt(currentInterestRate);
  }
}
