import { ZERO_ADDRESS } from '../constants';
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
    // If token address is zero address, it means it's a chain native token, and we need to
    // get it's balance using .getBalance() instead of ERC20 contract's balanceOf()
    if (tokenAddress === ZERO_ADDRESS) {
      const provider = getDefaultProvider(this.chain);

      return new Decimal(await provider.getBalance(walletAddress));
    }

    const contract = new ERC20Contract(this.chain, tokenAddress);
    return new Decimal(await contract.balanceOf(walletAddress));
  }
}
