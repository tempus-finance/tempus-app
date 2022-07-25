import {
  BehaviorSubject,
  map,
  combineLatest,
  from,
  of,
  Subscription,
  filter,
  Observable,
  merge,
  mergeMap,
  catchError,
} from 'rxjs';
import { Chain, getDefinedServices, Redeem } from 'tempus-core-services';
import { selectedChain$ } from './useSelectedChain';
import { servicesLoaded$ } from './useServicesLoaded';
import { walletAddress$ } from './useWalletAddress';

export const userRedeems$ = new BehaviorSubject<Redeem[] | null>(null);

const fetchUserRedeems = (chain: Chain, walletAddress: string): Observable<Redeem[] | null> => {
  try {
    const services = getDefinedServices(chain);
    return from(services.UserRedeemsService.fetchUserRedeems(walletAddress)).pipe(
      catchError(error => {
        console.error(`useUserRedeems - failed to fetch redeems for wallet ${walletAddress} on ${chain}`, error);
        return of(null);
      }),
    );
  } catch (error) {
    console.error(`useUserRedeems - failed to fetch redeems for wallet ${walletAddress} on ${chain}`, error);
    return of(null);
  }
};

const poolYieldEarnedStream$ = combineLatest([servicesLoaded$, selectedChain$, walletAddress$]).pipe(
  filter(([servicesLoaded]) => servicesLoaded),
  mergeMap(([, chain, walletAddress]) => {
    if (chain) {
      const userRedeemsFetch$ = fetchUserRedeems(chain, walletAddress).pipe(
        map(userRedeems => {
          if (userRedeems) {
            userRedeems$.next(userRedeems);
          }
        }),
      );

      return merge(userRedeemsFetch$);
    }
    return of(null);
  }),
);

let streamSubscription: Subscription = poolYieldEarnedStream$.subscribe();

export const subscribeUserRedeems = (): void => {
  unsubscribeUserRedeems();
  streamSubscription = poolYieldEarnedStream$.subscribe();
};
export const unsubscribeUserRedeems = (): void => {
  streamSubscription.unsubscribe();
};
export const resetUserRedeems = (): void => {
  userRedeems$.next([]);
};
