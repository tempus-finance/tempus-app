import { bind } from '@react-rxjs/core';
import { map, merge, switchMap } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { walletAddress$ } from './useWalletAddress';

export const walletBalances$ = merge(
  // Every time wallet address changes, we want to fetch wallet balances
  walletAddress$.pipe(
    map(walletAddress => {
      console.log(`Wallet address changed to ${walletAddress}, fetching token balances!`);
      return walletAddress;
    }),
    map(walletAddress => ({
      tokenList: getConfigManager().getTokenList(),
      walletAddress,
    })),
    switchMap(async result =>
      Promise.all(
        result.tokenList.map(async token => {
          const services = getServices(token.chain);
          if (!services) {
            throw new Error('walletBalances$ - Failed to get services');
          }
          const balance = await services.WalletBalanceService.getTokenBalance(token.address, result.walletAddress);

          return {
            chain: token.chain,
            tokenAddress: token.address,
            balance,
          };
        }),
      ),
    ),
    map(result => {
      const walletBalancesMap: { [tokenId: string]: Decimal } = {};
      result.forEach(tokenBalanceData => {
        walletBalancesMap[`${tokenBalanceData.chain}-${tokenBalanceData.tokenAddress}`] = tokenBalanceData.balance;
      });

      return walletBalancesMap;
    }),
  ),
);

export const [useWalletBalances] = bind(walletBalances$, {});
