import { ZERO_ETH_ADDRESS } from '../constants';
import { ERC20Contract } from '../contracts';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';
import { getDefaultProvider } from './getDefaultProvider';

export class WalletBalanceService {
  private chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<Decimal> {
    // ETH is a native token that does not have an ERC20 contract, we need to get balance for it using RPC provider.
    if (this.chain === 'ethereum' && tokenAddress === ZERO_ETH_ADDRESS) {
      const provider = getDefaultProvider(this.chain);

      return new Decimal(await provider.getBalance(walletAddress));
    }

    const contract = new ERC20Contract(this.chain, tokenAddress);
    return contract.balanceOf(walletAddress);
  }
}
