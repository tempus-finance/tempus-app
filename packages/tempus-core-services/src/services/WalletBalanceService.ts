import { ZERO_ADDRESS } from '../constants';
import { ERC20Contract } from '../contracts';
import { Decimal, DEFAULT_DECIMAL_PRECISION } from '../datastructures';
import { Chain } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';
import { getDefaultProvider } from './getDefaultProvider';

export class WalletBalanceService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<Decimal> {
    // If token address is zero address, it means it's a chain native token, and we need to
    // get it's balance using .getBalance() instead of ERC20 contract's balanceOf()
    if (tokenAddress === ZERO_ADDRESS) {
      const provider = getDefaultProvider(this.chain);

      // Native tokens always have default precision
      return new Decimal(await provider.getBalance(walletAddress), DEFAULT_DECIMAL_PRECISION);
    }

    const tokenPrecision = this.getTokenPrecision(tokenAddress);

    // TODO - Create a getter for all contract classes
    const contract = new ERC20Contract(this.chain, tokenAddress, tokenPrecision);
    return contract.balanceOf(walletAddress);
  }
}
