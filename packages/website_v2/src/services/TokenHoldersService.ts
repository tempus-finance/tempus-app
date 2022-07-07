import { BigNumber, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, Decimal, ERC20, ERC20ABI, ZERO } from 'tempus-core-services';
import config from '../config';
import { TEMP_PRECISION } from '../constants';

interface TokenHolderData {
  [holderAddress: string]: {
    balance: Decimal;
  };
}

class TokenHoldersService {
  static async getHoldersCount(): Promise<number | null> {
    const tokenHolderData: TokenHolderData = {};

    try {
      const results = await Promise.all(
        Object.keys(config).map(async key => {
          const chain = key as Chain;

          // Skip test chains
          if (config[chain].testChain) {
            return 0;
          }

          const contract = await this.getTokenContract(chain, config[chain].tempTokenAddress);

          const transferEvents = await contract.queryFilter(contract.filters.Transfer());
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
    } catch {
      console.error('getHoldersCount - Failed to fetch TEMP holder');
      return null;
    }
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
