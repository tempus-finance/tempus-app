import { ethers, BigNumber } from 'ethers';
import { ERC20, ERC20ABI, getDefaultProvider } from 'tempus-core-services';
import { tempTokenAddress } from '../constants';

class TokenHoldersService {
  static async getHoldersCount(): Promise<number> {
    const contract = await this.getTokenContract();

    const transferEvents = await contract.queryFilter(contract.filters.Transfer());

    const holderAddresses: string[] = transferEvents.map(
      (transferEvent: { args: { to: any } }) => transferEvent.args.to,
    );
    const uniqueHolderAddresses = [...new Set(holderAddresses)];

    let holderBalances: { balance: BigNumber; address: string }[] = [];
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
  }

  private static async getHolderBalancesBatch(
    addresses: string[],
    currentBalances: Array<{ balance: BigNumber; address: string }>,
  ) {
    const balancePromises: Promise<{ balance: BigNumber; address: string }>[] = [];
    addresses.forEach(address => {
      balancePromises.push(this.getHolderBalance(address));
    });
    const balances = await Promise.all(balancePromises);

    return [...balances, ...currentBalances];
  }

  private static async getHolderBalance(address: string): Promise<{ balance: BigNumber; address: string }> {
    const contract = await this.getTokenContract();

    const balance = await contract.balanceOf(address);

    return {
      balance,
      address,
    };
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
