import { Chain, ChainConfig, Config, ProtocolName, TempusPool, Ticker, ZERO_ADDRESS } from 'tempus-core-services';
import config from './config';

export interface TokenListItem {
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

  getImmaturePools(filterByChain?: Chain, filterByToken?: Ticker, filterByProtocol?: ProtocolName): TempusPool[] {
    return this.getFilteredPoolList(filterByChain, filterByToken, filterByProtocol).filter(
      pool => pool.maturityDate > Date.now(),
    );
  }

  getEarliestStartDate(filterByChain?: Chain, filterByToken?: Ticker, filterByProtocol?: ProtocolName): Date {
    const earliestPoolList = this.getFilteredPoolList(filterByChain, filterByToken, filterByProtocol).sort(
      (poolA, poolB) => poolA.startDate - poolB.startDate,
    );

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
    const chainToAddresses = new Map<Chain, Set<string>>();

    const poolList = this.getPoolList();
    poolList.forEach(pool => {
      const poolChain = pool.chain;

      if (poolChain) {
        if (!chainToAddresses.has(poolChain)) {
          chainToAddresses.set(poolChain, new Set());
        }

        [
          pool.backingTokenAddress,
          pool.yieldBearingTokenAddress,
          pool.principalsAddress,
          pool.yieldsAddress,
          pool.ammAddress,
        ].forEach(address => {
          chainToAddresses.get(poolChain)?.add(address);
        });
      } else {
        console.warn(`Pool ${pool.address} does not contain chain in it's config!`);
      }
    });

    // Add native token for each chain to token list
    const chainList = this.getChainList();
    chainList.forEach(chain => {
      if (!chainToAddresses.has(chain)) {
        chainToAddresses.set(chain, new Set());
      }

      // Native token on each chain always has ZERO_ADDRESS
      chainToAddresses.get(chain)?.add(ZERO_ADDRESS);
    });

    this.tokenList = [...chainToAddresses.entries()]
      .map(([chain, addresses]) =>
        [...addresses].map(
          address =>
            ({
              address,
              chain,
            } as TokenListItem),
        ),
      )
      .flat();
  }
}

export default ConfigManager;
