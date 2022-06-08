import { StatsV2Contract } from '../contracts/StatsV2Contract';
import { Decimal, ZERO } from '../datastructures';
import { Chain } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';

interface UserPoolTokenBalances {
  capitalsBalance: Decimal;
  yieldsBalance: Decimal;
  lpBalance: Decimal;
}

export class PoolBalanceService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async getPoolBalance(
    poolAddress: string,
    userTokenBalances: UserPoolTokenBalances,
    getBalanceInToken: 'backing' | 'yield-bearing',
  ): Promise<Decimal> {
    // In case user does not have position in the pool - skip contract call and return zero for pool balance
    if (
      userTokenBalances.capitalsBalance.isZero() &&
      userTokenBalances.yieldsBalance.isZero() &&
      userTokenBalances.lpBalance.isZero()
    ) {
      return ZERO;
    }

    const statsContractAddress = this.getStatsAddressForPool(poolAddress);
    const ammContractAddress = this.getAmmAddressForPool(poolAddress);

    // Using V2 contract by default because it's the only one deployed
    // Once we have new Stats contract, we should check the version here and use appropriate contract class
    const statsContract = new StatsV2Contract(this.chain, statsContractAddress);

    const threshold = userTokenBalances.capitalsBalance
      .add(userTokenBalances.yieldsBalance)
      .add(userTokenBalances.lpBalance)
      .div(new Decimal(1000));

    const poolConfig = this.getPoolConfig(poolAddress);

    const estimateData = await statsContract.estimateExitAndRedeem(
      ammContractAddress,
      userTokenBalances.capitalsBalance,
      userTokenBalances.yieldsBalance,
      userTokenBalances.lpBalance,
      poolConfig.tokenPrecision.backingToken,
      poolConfig.tokenPrecision.yieldBearingToken,
      poolConfig.tokenPrecision.principals,
      poolConfig.tokenPrecision.yields,
      poolConfig.tokenPrecision.lpTokens,
      threshold,
      getBalanceInToken === 'backing',
    );

    return estimateData.tokenAmount;
  }
}
