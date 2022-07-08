import { BigNumber, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, Decimal, ERC20, ERC20ABI, ZERO } from 'tempus-core-services';
import config from '../config';
import { TEMP_PRECISION } from '../constants';

// TODO - Refactor this to use graph service
const tokenDeployBlocks = {
  ethereum: 13512104,
  fantom: 30428726,
  'ethereum-fork': 13512104,
  unsupported: 0,
};

// TODO - Refactor this to use graph service
const chainBatchBlockRange = {
  ethereum: 500000, // 500K
  fantom: 10000000, // 10M
  'ethereum-fork': 1000000, // 1M
  unsupported: 0,
};

interface TokenHolderData {
  [holderAddress: string]: {
    balance: Decimal;
  };
}

class TokenHoldersService {
  static async getHoldersCount(): Promise<number | null> {
    try {
      const results = await Promise.all(
        Object.keys(config).map(async key => {
          const chain = key as Chain;

          const tokenHolderData: TokenHolderData = {};

          // Skip test chains
          if (config[chain].testChain) {
            return 0;
          }

          const transferEvents = await this.fetchEventsInBatches(
            chain,
            config[chain].tempTokenAddress,
            tokenDeployBlocks[chain],
            chainBatchBlockRange[chain],
          );
          transferEvents.forEach((transferEvent: any) => {
            const fromAddress = transferEvent.args.from;
            const toAddress = transferEvent.args.to;
            const amount = new Decimal(BigNumber.from(transferEvent.args.value), TEMP_PRECISION);

            if (!tokenHolderData[toAddress]) {
              tokenHolderData[toAddress] = {
                balance: new Decimal(0),
              };
            }
            tokenHolderData[toAddress].balance = tokenHolderData[toAddress].balance.add(amount);

            if (!tokenHolderData[fromAddress]) {
              tokenHolderData[fromAddress] = {
                balance: new Decimal(0),
              };
            }
            tokenHolderData[fromAddress].balance = tokenHolderData[fromAddress].balance.sub(amount);
          });

          let holderCount = 0;
          Object.keys(tokenHolderData).forEach(tokenHolderAddress => {
            if (tokenHolderData[tokenHolderAddress].balance.gt(ZERO)) {
              holderCount += 1;
            }
          });

          return holderCount;
        }),
      );

      let totalHolders = 0;
      results.forEach(result => {
        totalHolders += result;
      });

      return totalHolders;
    } catch (error) {
      console.error('getHoldersCount - Failed to fetch TEMP holder', error);
      return null;
    }
  }

  /**
   * Fetches transfer events in multiple batches because query fetch size is limited to 10k entries
   */
  private static async fetchEventsInBatches(
    chain: Chain,
    tokenAddress: string,
    tokenDeployBlock: number,
    batchSize: number,
  ) {
    const provider = await this.getProvider(chain);

    const latestBlock = await provider.getBlock('latest');

    const batches: { form: number; to: number }[] = [];
    for (let i = tokenDeployBlock; i <= latestBlock.number; i += batchSize) {
      batches.push({
        form: i,
        to: Math.min(i + batchSize, latestBlock.number),
      });
    }

    const contract = await this.getTokenContract(chain, tokenAddress);

    const results = await Promise.all(
      batches.map(async batch => contract.queryFilter(contract.filters.Transfer(), batch.form, batch.to)),
    );

    return results.flat();
  }

  private static async getTokenContract(chain: Chain, address: string) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(address, ERC20ABI, provider) as ERC20;
  }

  private static async getProvider(chain: Chain): Promise<any> {
    if (chain === 'fantom') {
      return new JsonRpcProvider(process.env.REACT_APP_FANTOM_RPC, { chainId: 250, name: 'Fantom Opera' });
    }

    const browserProvider = (window as any).ethereum;

    if (browserProvider && browserProvider.chainId && parseInt(browserProvider.chainId, 16) === 1) {
      return new ethers.providers.Web3Provider(browserProvider, 'any');
    }
    return new JsonRpcProvider(process.env.REACT_APP_ETHEREUM_RPC, { chainId: 1, name: 'homestead' });
  }
}
export default TokenHoldersService;
