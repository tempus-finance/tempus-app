import { Octokit } from 'octokit';
import { Chain, ChainConfig, Config } from 'tempus-core-services';

const TempusPoolsConfig = {
  owner: 'tempus-finance',
  repo: 'tempus-pools-config',
  path: 'config.json',
};

let config: Config;
export const getConfig = async (): Promise<Config> => {
  if (!config) {
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
          config = JSON.parse(decodedString);
        }
      }
    } catch (error) {
      console.log('Error retrieving Tempus Pools Config', error);
      return {};
    }
  }

  if (config) {
    config = {
      ...config,
      ethereum: {
        ...config.ethereum,
        privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
        alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
      },
      fantom: {
        ...config.fantom,
        privateNetworkUrl: String(process.env.REACT_APP_FANTOM_RPC),
      },
      'ethereum-fork': {
        ...config['ethereum-fork'],
        privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
        alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
      },
    };
  }

  return config;
};

export const getChainConfig = async (chain: Chain): Promise<ChainConfig> => {
  const configData = await getConfig();

  return configData[chain];
};
