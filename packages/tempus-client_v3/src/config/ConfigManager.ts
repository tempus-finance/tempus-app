import { Chain, ChainConfig, Config, ProtocolName, TempusPool, Ticker } from 'tempus-core-services';
import config from './config';

interface TokenListItem {
  chain: Chain;
  address: string;
}

class ConfigManager {
  private config: Config = config;

  private chainList: Chain[] = [];
  private poolList: TempusPool[] = [];
  private tokenList: TokenListItem[] = [];

  init(): void {
    this.retrieveChainList();
    this.retrievePoolList();
    this.retrieveTokenList();
  }

  getConfig(): Config {
    return this.config;
  }

  getChainConfig(chain: Chain): ChainConfig {
    return this.config[chain];
  }

  getChainList(): Chain[] {
    return this.chainList;
  }

  getPoolList(): TempusPool[] {
    return this.poolList;
  }

  getTokenList(): TokenListItem[] {
    return this.tokenList;
  }

  // TODO add tests
  getFilteredPoolList(filterByChain?: Chain, filterByToken?: Ticker, filterByProtocol?: ProtocolName): TempusPool[] {
    return this.getPoolList()
      .filter(pool => {
        if (filterByChain) {
          return pool.chain === filterByChain;
        }

        return true;
      })
      .filter(pool => {
        if (filterByToken) {
          return pool.backingToken === filterByToken;
        }

        return true;
      })
      .filter(pool => {
        if (filterByProtocol) {
          return pool.protocol === filterByProtocol;
        }

        return true;
      });
  }

  getEarliestStartDate(filterByChain?: Chain, filterByToken?: Ticker, filterByProtocol?: ProtocolName): Date {
    const earliestPoolList = this.getPoolList()
      .filter(pool => {
        if (filterByChain) {
          return pool.chain === filterByChain;
        }

        return true;
      })
      .filter(pool => {
        if (filterByToken) {
          return pool.backingToken === filterByToken;
        }

        return true;
      })
      .filter(pool => {
        if (filterByProtocol) {
          return pool.protocol === filterByProtocol;
        }

        return true;
      })
      .sort((poolA, poolB) => (poolA.startDate < poolB.startDate ? -1 : 1));

    if (earliestPoolList && earliestPoolList.length) {
      return new Date(earliestPoolList[0].startDate);
    }

    throw new Error('getEarliestStartDate - Cannot find a pool by search criteria');
  }

  getMaturityDates(filterByChain?: Chain, filterByToken?: Ticker, filterByProtocol?: ProtocolName): Date[] {
    const today = new Date();
    const todayTime = today.getTime();

    const filteredPools = this.getFilteredPoolList(filterByChain, filterByToken, filterByProtocol)
      .filter(pool => todayTime <= pool.maturityDate)
      .sort((poolA, poolB) => (poolA.maturityDate < poolB.maturityDate ? -1 : 1));

    const dates: Date[] = [];
    filteredPools.forEach(pool => dates.push(new Date(pool.maturityDate)));

    return dates;
  }

  private retrieveChainList(): void {
    this.chainList = Object.keys(this.config) as Chain[];
  }

  private retrievePoolList(): void {
    const pools: TempusPool[] = [];

    Object.keys(this.config).forEach((chain: string) => {
      this.getChainConfig(chain as Chain).tempusPools.forEach((pool: TempusPool) => {
        pools.push({ ...pool, chain: chain as Chain });
      });
    });

    this.poolList = pools;
  }

  private retrieveTokenList(): void {
    const result: TokenListItem[] = [];

    const poolList = this.getPoolList();
    poolList.forEach(pool => {
      const poolChain = pool.chain;

      if (poolChain) {
        result.push(
          {
            address: pool.backingTokenAddress,
            chain: poolChain,
          },
          {
            address: pool.yieldBearingTokenAddress,
            chain: poolChain,
          },
          {
            address: pool.principalsAddress,
            chain: poolChain,
          },
          {
            address: pool.yieldsAddress,
            chain: poolChain,
          },
          {
            address: pool.ammAddress,
            chain: poolChain,
          },
        );
      } else {
        console.warn(`Pool ${pool.address} does not contain chain in it's config!`);
      }
    });

    this.tokenList = result;
  }
}

export default ConfigManager;
