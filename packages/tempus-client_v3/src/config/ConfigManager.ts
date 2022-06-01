import { Octokit } from 'octokit';
import { Chain, ChainConfig, Config, ProtocolName, TempusPool, Ticker } from 'tempus-core-services';

const TempusPoolsConfig = {
  owner: 'tempus-finance',
  repo: 'tempus-pools-config',
  path: 'config.json',
  ref: process.env.REACT_APP_CONFIG_BRANCH,
};

export interface TokenListItem {
  chain: Chain;
  address: string;
}

class ConfigManager {
  private config: Config = {};

  private chainList: Chain[] = [];
  private tokenList: TokenListItem[] = [];

  async init(): Promise<boolean> {
    const success = await this.retrieveConfig();

    this.retrieveChainList();
    this.retrieveTokenList();

    return success;
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
    const pools: TempusPool[] = [];

    Object.keys(this.config).forEach((chain: string) => {
      this.getChainConfig(chain as Chain).tempusPools.forEach((pool: TempusPool) => {
        pools.push({ ...pool, chain: chain as Chain });
      });
    });

    return pools;
  }

  getTokenList(): TokenListItem[] {
    return this.tokenList;
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

  private retrieveChainList(): void {
    this.chainList = Object.keys(this.config) as Chain[];
  }

  private retrieveTokenList(): void {
    const result: TokenListItem[] = [];

    // Checks if token is already added to the list and keeps resulting list unique
    const insertToken = (address: string, chain: Chain, accumulator: TokenListItem[]) => {
      const existingIndex = accumulator.findIndex(
        tokenListItem => tokenListItem.address === address && tokenListItem.chain === chain,
      );
      if (existingIndex === -1) {
        accumulator.push({
          address,
          chain,
        });
      }
    };

    const poolList = this.getPoolList();
    poolList.forEach(pool => {
      const poolChain = pool.chain;

      if (poolChain) {
        insertToken(pool.backingTokenAddress, poolChain, result);
        insertToken(pool.yieldBearingTokenAddress, poolChain, result);
        insertToken(pool.principalsAddress, poolChain, result);
        insertToken(pool.yieldsAddress, poolChain, result);
        insertToken(pool.ammAddress, poolChain, result);
      } else {
        console.warn(`Pool ${pool.address} does not contain chain in it's config!`);
      }
    });

    this.tokenList = result;
  }

  private async retrieveConfig(): Promise<boolean> {
    try {
      const octokit = new Octokit();

      const response = await octokit.rest.repos.getContent({
        mediaType: {
          format: 'json',
        },
        ...TempusPoolsConfig,
      });

      if (response.status === 200) {
        const { data } = response;
        const { content } = data as any;

        if (content) {
          const decodedString = await String(Buffer.from(content, 'base64'));
          this.config = JSON.parse(decodedString);

          if (decodedString) {
            if (process.env.REACT_APP_ETHEREUM_RPC) {
              this.config = {
                ...this.config,
                ethereum: {
                  ...this.config.ethereum,
                  privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
                  alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
                },
                'ethereum-fork': {
                  ...this.config['ethereum-fork'],
                  privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
                  alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
                },
              };
            }

            if (process.env.REACT_APP_FANTOM_RPC) {
              this.config = {
                ...this.config,
                fantom: {
                  ...this.config.fantom,
                  privateNetworkUrl: String(process.env.REACT_APP_FANTOM_RPC),
                },
              };
            }
          }

          return true;
        }
      }
    } catch (error) {
      console.log('Error retrieving Tempus Pools Config', error);
      return false;
    }

    return false;
  }
}

export default ConfigManager;
