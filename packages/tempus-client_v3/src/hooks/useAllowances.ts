import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  merge,
  concatMap,
  Observable,
  withLatestFrom,
  of,
  from,
  map,
  Subscription,
  tap,
  debounce,
  scan,
  interval,
} from 'rxjs';
import { bind } from '@react-rxjs/core';
import { JsonRpcSigner } from '@ethersproject/providers';
import {
  Decimal,
  getDefinedServices,
  ZERO_ADDRESS,
  DEFAULT_DECIMAL_PRECISION,
  Config,
  ZERO,
} from 'tempus-core-services';
import { servicesLoaded$ } from './useServicesLoaded';
import { config$ } from './useConfig';
import { signer$ } from './useSigner';
import { walletAddress$ } from './useWalletAddress';
import { tokenApproveStatus$ } from './useApproveToken';
import { TokenBalance, tokenBalanceDataMap } from './useTokenBalance';
import { DEBOUNCE_IN_MS } from '../constants';

interface AllowanceMap {
  [chainTokenAddress: string]: {
    alwaysApproved: boolean;
    amount: Decimal;
  };
}

const DEFAULT_VALUE: AllowanceMap = {};

const rawAllowances$ = new BehaviorSubject<AllowanceMap>(DEFAULT_VALUE);
export const allowances$ = rawAllowances$.pipe(distinctUntilChanged());

const tokenBalance$ = merge(...Array.from(tokenBalanceDataMap.values()).map(({ subject$ }) => subject$));

// stream$ for listening token balance changes for fetching allowance
const tokenBalanceStream$ = tokenBalance$.pipe(
  withLatestFrom(config$, walletAddress$, signer$, servicesLoaded$),
  filter(
    ([, config, walletAddress, signer, servicesLoaded]) =>
      Boolean(config) && Boolean(walletAddress) && Boolean(signer) && servicesLoaded,
  ),
  concatMap<[TokenBalance, Config, string, JsonRpcSigner | null, boolean], Observable<AllowanceMap>>(
    ([{ balance, address, chain }, config, walletAddress, signer]) => {
      if (!balance || balance.lte(0) || address === ZERO_ADDRESS) {
        // always approved
        return of({
          [`${chain}-${address}`]: {
            alwaysApproved: true,
            amount: ZERO,
          },
        } as AllowanceMap);
      }

      try {
        const erc20TokenServiceGetter = getDefinedServices(chain).ERC20TokenServiceGetter(
          address,
          chain,
          signer as JsonRpcSigner,
        );
        const spenderAddress = config[chain].tempusControllerContract;
        return from(erc20TokenServiceGetter.getAllowance(walletAddress, spenderAddress)).pipe(
          map(
            bigNum =>
              ({
                [`${chain}-${address}`]: {
                  alwaysApproved: false,
                  amount: new Decimal(bigNum, DEFAULT_DECIMAL_PRECISION),
                },
              } as AllowanceMap),
          ),
        );
      } catch (error) {
        console.error(`useAllowance - Fail to get the allowance for token ${address} on ${chain}`, error);
        return of(DEFAULT_VALUE);
      }
    },
  ),
);

// stream$ for listening approval status
const approvalStream$ = tokenApproveStatus$.pipe(
  filter(status => Boolean(status.request) && status.success),
  map(
    ({ request }) =>
      ({
        [`${request?.chain}-${request?.tokenAddress}`]: {
          alwaysApproved: false,
          amount: request?.amount as Decimal,
        },
      } as AllowanceMap),
  ),
);

// merge all stream$ into one
const stream$ = merge(tokenBalanceStream$, approvalStream$).pipe(
  scan(
    (allAllowances, allowance) => ({
      ...allAllowances,
      ...allowance,
    }),
    {} as AllowanceMap,
  ),
  debounce<AllowanceMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(poolTvls => rawAllowances$.next(poolTvls)),
);

export const [useAllowances] = bind(stream$, DEFAULT_VALUE);

let subscription: Subscription;

export const subscribeAllowance = (): void => {
  unsubscribeAllowance();
  subscription = stream$.subscribe();
};
export const unsubscribeAllowance = (): void => subscription?.unsubscribe?.();
export const resetAllowance = (): void => rawAllowances$.next(DEFAULT_VALUE);
