import { bind } from '@react-rxjs/core';
import { combineLatest, map, mergeMap, from, merge, scan, interval, debounce, catchError, of } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';

const DEBOUNCE_IN_MS = 500;

type TokenChainAddressMap = { [tokenId: string]: Decimal };

export const walletBalances$ = combineLatest([
  of('0x482eE9510074bbdA290211320a01f95527DA8d4e'),
  of([] as any),
  of('0x482eE9510074bbdA290211320a01f95527DA8d4e'),
  of('0x482eE9510074bbdA290211320a01f95527DA8d4e'),
  of('0x482eE9510074bbdA290211320a01f95527DA8d4e'),
  of('0x482eE9510074bbdA290211320a01f95527DA8d4e'),
]).pipe(
  // Every time wallet address changes, we want to fetch wallet balances
  mergeMap(([walletAddress, tokenList, walletAddress3, walletAddress4, walletAddress5]) => {
    console.log(`Wallet address changed to ${walletAddress}, fetching token balances!`);

    console.log(walletAddress3, walletAddress4, walletAddress5);

    const tokenBalances = tokenList.map((token: any) => {
      const services = getServices(token.chain);
      if (!services) {
        throw new Error('walletBalancesSubject$ - Failed to get services');
      }

      console.log(`Fetching token balance ${token.address}, ${token.chain}`);
      const balance$ = from(services.WalletBalanceService.getTokenBalance(token.address, walletAddress));

      return balance$.pipe(
        map(balance => ({
          [`${token.chain}-${token.address}`]: balance,
        })),
      );
    });

    return merge(...tokenBalances);
  }),
  scan((currentTokenBalances: any, tokenBalances: any) => ({
    ...currentTokenBalances,
    ...tokenBalances,
  })),
  debounce(() => interval(DEBOUNCE_IN_MS)),
  // shareLatest(),
  catchError(error => {
    console.error('usePoolBalances - StatisticsService.getUserPoolBalanceUSD', error);
    return of({} as TokenChainAddressMap);
  }),
);

export const [useWalletBalances] = bind(walletBalances$, {});
