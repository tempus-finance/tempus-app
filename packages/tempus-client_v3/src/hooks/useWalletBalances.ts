import { bind } from '@react-rxjs/core';
import { map, merge, switchMap } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { walletAddress$ } from './useWalletAddress';

export const walletBalancesSubject$ = merge(
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
            throw new Error('walletBalancesSubject$ - Failed to get services');
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

export const [useWalletBalances] = bind(walletBalancesSubject$, {});

// import { bind, DefaultedStateObservable, state, useStateObservable } from '@react-rxjs/core';
// import { createSignal } from '@react-rxjs/utils';
// import { Observable } from 'rxjs';
// import { useCallback, useEffect } from 'react';
// import { Chain, Decimal, getServices } from 'tempus-core-services';
// import { getConfigManager } from '../config/getConfigManager';
// import { useWalletAddress } from './useWalletAddress';

// export const [useTokenBalance] = bind(tokenBalance$);

// type TokenData = {
//   signal: {
//     observable: Observable<Decimal>;
//   };
//   state: DefaultedStateObservable<Decimal | null>;
// };

// // Map key is chainName + tokenAddress
// const tokenDataMap = new Map<string, TokenData>();

// // Cannot use top-level await (using then as a fallback)
// getConfigManager()
//   .getConfigAsync()
//   .then(() => {
//     const tokenList = getConfigManager().getTokenList();
//     tokenList.forEach(token => {
//       const tokenBalance$ = new Observable<Decimal>(() => {});

//       tokenDataMap.set(`${token.chain}-${token.address}`, {
//         signal: {
//           observable: tokenBalance$,
//         },
//         state: state(tokenBalance$, null),
//       });
//     });
//   });

// /**
//  * React hook that fetches and returns balance of requested token
//  * @param tokenId Token we want to get balance for
//  * @returns Returns balance of the token
//  */
// /* export function useTokenBalance(tokenId: string): [Decimal | null] {
//   const tokenData = tokenDataMap.get(tokenId);

//   // If token data is not yet initialized - use empty observable while waiting for token data to initialize
//   const tokenBalance = useStateObservable(tokenData ? tokenData.state : state(createSignal<Decimal>()[0], null));

//   const [walletAddress] = useWalletAddress();

//   const fetchBalance = useCallback(async () => {
//     if (!walletAddress || !tokenData) {
//       return;
//     }

//     const tokenChain = tokenId.split('-')[0] as Chain;
//     const tokenAddress = tokenId.split('-')[1];

//     const services = getServices(tokenChain);
//     if (services) {
//       const balance = await services.WalletBalanceService.getTokenBalance(tokenAddress, walletAddress);

//       tokenData.signal.setter(balance);
//     }
//   }, [tokenData, tokenId, walletAddress]);

//   /**
//    * Fetch balance on mount
//    */
// /* useEffect(() => {
//     fetchBalance();
//   }, [fetchBalance]);

//   return [tokenBalance];
// } */
