import { Chain, ChainConfig, Config, TempusPool } from '../interfaces';

export type ConfigGetter = () => Config;

export class BaseService {
  private getConfig: ConfigGetter;

  constructor(getConfig: ConfigGetter) {
    this.getConfig = getConfig;
  }

  getChainConfig(chain: Chain): ChainConfig {
    const config = this.getConfig();

    return config[chain];
  }

  getPoolList(): TempusPool[] {
    const config = this.getConfig();

    const pools: TempusPool[] = [];

    Object.keys(config).forEach(key => {
      const chainConfig = this.getChainConfig(key as Chain);

      pools.push(...chainConfig.tempusPools);
    });

    return pools;
  }

  getPoolConfig(poolAddress: string): TempusPool {
    const pools = this.getPoolList();

    const poolConfig = pools.find(pool => pool.address === poolAddress);
    if (!poolConfig) {
      throw new Error(`Failed to get config for pool '${poolAddress}'`);
    }

    return poolConfig;
  }

  getChainConfigForPool(poolAddress: string): ChainConfig {
    const poolConfig = this.getPoolConfig(poolAddress);

    return this.getChainConfig(poolConfig?.chain);
  }

  getStatsAddressForPool(poolAddress: string): string {
    const poolChainConfig = this.getChainConfigForPool(poolAddress);

    return poolChainConfig.statisticsContract;
  }

  getAmmAddressForPool(poolAddress: string): string {
    const poolConfig = this.getPoolConfig(poolAddress);

    return poolConfig.ammAddress;
  }

  getTokenPrecision(tokenAddress: string): number {
    let precision: number | null = null;

    const poolList = this.getPoolList();
    poolList.forEach(pool => {
      switch (tokenAddress) {
        case pool.backingTokenAddress:
          precision = pool.tokenPrecision.backingToken;
          break;
        case pool.yieldBearingTokenAddress:
          precision = pool.tokenPrecision.yieldBearingToken;
          break;
        case pool.principalsAddress:
          precision = pool.tokenPrecision.principals;
          break;
        case pool.yieldsAddress:
          precision = pool.tokenPrecision.yields;
          break;
        case pool.ammAddress:
          precision = pool.tokenPrecision.lpTokens;
          break;
        default:
          break;
      }
    });

    if (precision === null) {
      throw new Error(`BaseService - getTokenPrecision() - Failed to get precision for token '${tokenAddress}'`);
    }

    return precision;
  }
}
