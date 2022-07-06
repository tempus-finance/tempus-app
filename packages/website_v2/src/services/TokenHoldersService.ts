import { ethers, BigNumber } from 'ethers';
import { ERC20, ERC20ABI, getDefaultProvider } from 'tempus-core-services';
import { tempTokenAddress } from '../constants';

interface HolderBalance {
  balance: BigNumber;
  address: string;
}

class TokenHoldersService {
  static async getHoldersCount(): Promise<number | null> {
    try {
      const contract = await this.getTokenContract();

      const transferEvents = await contract.queryFilter(contract.filters.Transfer());

      const holderAddresses: string[] = transferEvents.map(
        (transferEvent: { args: { to: any } }) => transferEvent.args.to,
      );
      const uniqueHolderAddresses = [...new Set(holderAddresses)];

      let holderBalances: HolderBalance[] = [];
      while (uniqueHolderAddresses.length > 0) {
        const batch = uniqueHolderAddresses.splice(0, 2000);

        // eslint-disable-next-line no-await-in-loop
        holderBalances = await this.getHolderBalancesBatch(batch, holderBalances);
      }

      holderBalances.sort((a, b) => {
        if (a.balance.gte(b.balance)) {
          return -1;
        }
        return 1;
      });

      return holderBalances.filter(holder => !holder.balance.isZero()).length;
    } catch {
      console.error('getHoldersCount - Failed to fetch TEMP holder');
      return null;
    }
  }

  private static async getHolderBalancesBatch(addresses: string[], currentBalances: Array<HolderBalance>) {
    const balancePromises: Promise<HolderBalance | null>[] = [];
    addresses.forEach(address => {
      balancePromises.push(this.getHolderBalance(address));
    });
    const balances = await Promise.all(balancePromises);

    return [...(balances.filter(balance => balance !== null) as HolderBalance[]), ...currentBalances];
  }

  private static async getHolderBalance(address: string): Promise<HolderBalance | null> {
    try {
      const contract = await this.getTokenContract();

      const balance = await contract.balanceOf(address);

      return {
        balance,
        address,
      };
    } catch {
      console.error(`getHolderBalance - Failed to fetch TEMP balance for holder ${address}`);
      return null;
    }
  }

  private static async getTokenContract() {
    const provider = await this.getProvider();

    return new ethers.Contract(tempTokenAddress, ERC20ABI, provider) as ERC20;
  }

  private static async getProvider(): Promise<any> {
    if ((window as any).ethereum && !(window as any).ethereum.chainId) {
      await TokenHoldersService.wait();
      return this.getProvider();
    }

    if ((window as any).ethereum && parseInt((window as any).ethereum.chainId, 16) === 1) {
      return new ethers.providers.Web3Provider((window as any).ethereum, 'any');
    }
    return getDefaultProvider('ethereum');
  }

  private static async wait() {
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  }
}
export default TokenHoldersService;
