import Axios from 'axios';
import { BigNumber } from 'ethers';
import { Decimal } from '../datastructures';
import { Chain, Ticker } from '../interfaces';
import { Redeem } from '../interfaces/Redeem';
import { BaseService, ConfigGetter } from './BaseService';

interface ResponseData {
  data: {
    data: {
      redeems: [
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

export class UserRedeemsService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async fetchUserRedeems(walletAddress: string): Promise<Redeem[]> {
    const chainConfig = this.getChainConfig(this.chain);

    // TODO - Add query pagination in case user has more then 1000 redeems
    const {
      data: {
        data: { redeems },
      },
    } = await Axios.post<{ query: string }, ResponseData>(chainConfig.subgraphUrl, {
      query: `
        query {
          redeems (first: 1000, where: {user_: {id: "${walletAddress}"}}) {
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

    return redeems.map(redeem => {
      const transactionHash = redeem.id;
      const userWallet = redeem.user.id;
      const date = new Date(Number(redeem.timestamp) * 1000);
      const amountRedeemed = new Decimal(BigNumber.from(redeem.amount), 18);
      const tokenRedeemed = redeem.token;
      const tokenRate = new Decimal(redeem.tokenRate).div(new Decimal(redeem.tokenRateDenominator));
      const poolAddress = redeem.pool;

      return {
        transactionHash,
        userWallet,
        amountRedeemed,
        tokenRedeemed,
        tokenRate,
        date,
        poolAddress,
      };
    });
  }
}
