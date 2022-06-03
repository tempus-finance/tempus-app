import { bind } from '@react-rxjs/core';
import { BehaviorSubject, map, combineLatest, from, of, merge, mergeMap, Subscription, tap } from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { walletAddress$ } from './useWalletAddress';

// Improves readability of the code
type TokenChainAddressId = string;

interface TokenBalanceData {
  subject: BehaviorSubject<Decimal | null>;
  address: string;
  chain: Chain;
}

// Each token will have a separate BehaviorSubject, and this map will store them with some additional token data
const tokenBalanceDataMap = new Map<TokenChainAddressId, TokenBalanceData>();

// Create a BehaviorSubject for each token in the config file
const tokenList = getConfigManager().getTokenList();
tokenList.forEach(token => {
  const tokenChainAddressId = `${token.chain}-${token.address}`;

  tokenBalanceDataMap.set(tokenChainAddressId, {
    subject: new BehaviorSubject<Decimal | null>(null),
    address: token.address,
    chain: token.chain,
  });
});

// Stream that goes over all tokens and fetches their balance, this happens only when wallet address changes
const stream$ = combineLatest([walletAddress$]).pipe(
  // TODO - Include servicesLoaded$ stream here as well
  mergeMap(([walletAddress]) => {
    const tokenBalanceFetchMap = [...tokenBalanceDataMap.values()].map(tokenBalanceData => {
      if (!walletAddress) {
        return of(null);
      }

      const services = getServices(tokenBalanceData.chain);
      if (!services) {
        throw new Error('useWalletBalances - stream$ - Failed to get services');
      }
      const balanceFetch$ = from(
        services.WalletBalanceService.getTokenBalance(tokenBalanceData.address, walletAddress),
      );

      return balanceFetch$.pipe(
        map(tokenBalance => ({
          [`${tokenBalanceData.chain}-${tokenBalanceData.address}`]: {
            balance: tokenBalance,
            address: tokenBalanceData.address,
            chain: tokenBalanceData.chain,
          },
        })),
      );
    });

    return merge(...tokenBalanceFetchMap);
  }),
  tap(tokenDataMap => {
    if (tokenDataMap === null) {
      return;
    }

    Object.keys(tokenDataMap).forEach(key => {
      const tokenData = tokenDataMap[key];
      if (tokenData.balance) {
        const tokenBalanceData = tokenBalanceDataMap.get(`${tokenData.chain}-${tokenData.address}`);
        if (tokenBalanceData) {
          tokenBalanceData.subject.next(tokenData.balance);
        }
      }
    });
  }),
);

export const [useTokenBalance] = bind((tokenAddress: string, tokenChain: Chain | null) => {
  if (!tokenChain) {
    return of(null);
  }

  const tokenBalanceData = tokenBalanceDataMap.get(`${tokenChain}-${tokenAddress}`);
  if (tokenBalanceData) {
    return tokenBalanceData.subject;
  }
  return of(null);
}, null);

let subscription: Subscription = stream$.subscribe();

export const subscribe = (): void => {
  unsubscribe();
  subscription = stream$.subscribe();
};
export const unsubscribe = (): void => subscription.unsubscribe();
export const reset = (): void => {
  tokenBalanceDataMap.forEach(tokenBalanceData => tokenBalanceData.subject.next(null));
};
