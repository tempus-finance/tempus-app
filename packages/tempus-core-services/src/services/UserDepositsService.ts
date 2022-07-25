import Axios from 'axios';
import { BigNumber } from 'ethers';
import { Decimal } from '../datastructures';
import { Chain, Deposit, Ticker } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';

interface ResponseData {
  data: {
    data: {
      deposits: [
        {
          amount: string;
          id: string;
          pool: string;
          timestamp: string;
          token: Ticker;
          tokenRate: string;
          tokenRateDenominator: string;
          user: { id: string };
          userBalance: string;
        },
      ];
    };
  };
}

export class UserDepositsService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async fetchUserDeposits(walletAddress: string): Promise<Deposit[]> {
    const chainConfig = this.getChainConfig(this.chain);

    // TODO - Add query pagination in case user has more then 1000 deposits
    const {
      data: {
        data: { deposits },
      },
    } = await Axios.post<{ query: string }, ResponseData>(chainConfig.subgraphUrl, {
      query: `
        query {
          deposits (first: 1000, where: {user_: {id: "${walletAddress}"}}) {
            id
            amount
            token
            tokenRate
            tokenRateDenominator
            tokenPrecision
            userBalance
            timestamp
            pool
            user {
              id
            }
          }
        }
        `,
    });

    return deposits.map(deposit => {
      const transactionHash = deposit.id;
      const userWallet = deposit.user.id;
      const date = new Date(Number(deposit.timestamp) * 1000);
      const amountDeposited = new Decimal(BigNumber.from(deposit.amount), 18);
      const tokenDeposited = deposit.token;
      const tokenRate = new Decimal(deposit.tokenRate).div(new Decimal(deposit.tokenRateDenominator));
      const poolAddress = deposit.pool;

      return {
        transactionHash,
        userWallet,
        amountDeposited,
        tokenDeposited,
        tokenRate,
        date,
        poolAddress,
      };
    });
  }
}
