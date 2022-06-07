import { StatsV2Contract } from '../contracts/StatsV2Contract';
import { Decimal } from '../datastructures';
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
    walletAddress: string,
    userTokenBalances: UserPoolTokenBalances,
  ): Promise<Decimal> {
    // Using V2 contract by default because it's the only one deployed
    // Once we have new Stats contract, we should check the version here and use appropriate contract class
    const contract = new StatsV2Contract(this.chain, tokenAddress);
    return new Decimal(await contract.balanceOf(walletAddress));
  }
}
