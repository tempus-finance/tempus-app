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
import { Chain, getDefinedServices } from 'tempus-core-services';
import { Deposit } from 'tempus-core-services/dist/interfaces';
import { selectedChain$ } from './useSelectedChain';
import { servicesLoaded$ } from './useServicesLoaded';
import { walletAddress$ } from './useWalletAddress';

export const userDeposits$ = new BehaviorSubject<Deposit[]>([]);

const fetchUserDeposits = (chain: Chain, walletAddress: string): Observable<Deposit[] | null> => {
  try {
    const services = getDefinedServices(chain);
    return from(services.UserDepositsService.fetchUserDeposits(walletAddress)).pipe(
      catchError(error => {
        console.error(`useUserDeposits - failed to fetch deposits for wallet ${walletAddress} on ${chain}`, error);
        return of(null);
      }),
    );
  } catch (error) {
    console.error(`useUserDeposits - failed to fetch deposits for wallet ${walletAddress} on ${chain}`, error);
    return of(null);
  }
};

const poolYieldEarnedStream$ = combineLatest([servicesLoaded$, selectedChain$, walletAddress$]).pipe(
  filter(([servicesLoaded]) => servicesLoaded),
  mergeMap(([, chain, walletAddress]) => {
    if (chain) {
      const userDepositsFetch$ = fetchUserDeposits(chain, walletAddress).pipe(
        map(userDeposits => {
          if (userDeposits) {
            userDeposits$.next(userDeposits);
          }
        }),
      );

      return merge(userDepositsFetch$);
    }
    return of(null);
  }),
);

let streamSubscription: Subscription = poolYieldEarnedStream$.subscribe();

export const subscribeUserDeposits = (): void => {
  unsubscribeUserDeposits();
  streamSubscription = poolYieldEarnedStream$.subscribe();
};
export const unsubscribeUserDeposits = (): void => {
  streamSubscription.unsubscribe();
};
export const resetUserDeposits = (): void => {
  userDeposits$.next([]);
};
