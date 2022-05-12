import { Octokit } from 'octokit';
import { Chain, ChainConfig, Config, TempusPool } from 'tempus-core-services';

const TempusPoolsConfig = {
  owner: 'tempus-finance',
  repo: 'tempus-pools-config',
  path: 'config.json',
};

class ConfigManager {
  private config: Config = {} as Config;

  async init(): Promise<boolean> {
    return this.retrieveConfig();
  }

  getConfig(): Config {
    return this.config;
  }

  getChainConfig(chain: Chain): ChainConfig {
    return this.config[chain];
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
            this.config = {
              ...this.config,
              ethereum: {
                ...this.config.ethereum,
                privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
                alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
              },
              fantom: {
                ...this.config.fantom,
                privateNetworkUrl: String(process.env.REACT_APP_FANTOM_RPC),
              },
              'ethereum-fork': {
                ...this.config['ethereum-fork'],
                privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
                alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
              },
            };
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
