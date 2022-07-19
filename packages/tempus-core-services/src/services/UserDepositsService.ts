import Axios from 'axios';
import { Decimal } from '../datastructures';
import { Chain, Deposit } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';

export class UserDepositsService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async fetchUserDeposits(walletAddress: string): Promise<Deposit[]> {
    const chainConfig = this.getChainConfig(this.chain);

    // TODO - Add query pagination in case user has more then 1000 deposits
    const result = await Axios.post(chainConfig.subgraphUrl, {
      query: `
        query {
          deposits (first: 1000, where: {user_: {id: "${walletAddress}"}}) {
            id
            amount
            token
            tokenRate
            tokenRateDenominator
            userBalance
            timestamp
            user {
              id
            }
          }
        }
        `,
    });

    console.log(result);

    return [
      {
        amountDeposited: new Decimal(0),
        date: new Date(),
        tokenDeposited: 'ETH',
        tokenRate: new Decimal(1),
        transactionHash: '1',
        userWallet: 'a',
      },
    ];
  }
}
