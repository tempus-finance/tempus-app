import { Octokit } from 'octokit';
import { Config } from 'tempus-core-services';

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

  return config;
};
