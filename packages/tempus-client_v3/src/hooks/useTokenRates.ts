import { bind } from '@react-rxjs/core';
import {
  catchError,
  combineLatest,
  debounce,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
} from 'rxjs';
import { getServices, Decimal, StatisticsService, Chain, Ticker } from 'tempus-core-services';
import { poolList$ } from './useConfig';

const TOKEN_RATE_POLLING_INTERVAL_IN_MS = 30000;
const DEBOUNCE_IN_MS = 500;

interface TokenInfoMap {
  [chainTokenAddressString: string]: {
    chain: Chain;
    token: Ticker;
    address: string;
  };
}

interface TokenRateMap {
  [chainTokenAddressString: string]: Decimal | null;
}

const polling$: Observable<number> = interval(TOKEN_RATE_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const tokenRates$: Observable<TokenRateMap> = combineLatest([poolList$, polling$]).pipe(
  mergeMap(([tempusPools]) => {
    const uniqueTokens = Object.values(
      tempusPools.reduce(
        (obj, { chain, backingToken, backingTokenAddress }) => ({
          ...obj,
          [`${chain}-${backingTokenAddress}`]: {
            chain: chain as Chain,
            token: backingToken,
            address: backingTokenAddress,
          },
        }),
        {} as TokenInfoMap,
      ),
    );
    const tokenRates = uniqueTokens.map(({ chain, token, address }) => {
      // TODO: conceptually chain+ticker is not unique, it should accept chain+address instead
      //       but currently chainlink and gecko API doesnt support that
      const tokenRate = (getServices(chain as Chain)?.StatisticsService as StatisticsService).getRate(
        chain as Chain,
        token,
      );
      return tokenRate.pipe(
        map(
          rate =>
            ({
              [`${chain}-${address}`]: rate,
            } as TokenRateMap),
        ),
      );
    });

    return merge(...tokenRates);
  }),
  scan(
    (allRates, tokenRates) => ({
      ...allRates,
      ...tokenRates,
    }),
    {},
  ),
  debounce<TokenRateMap>(() => interval(DEBOUNCE_IN_MS)),
  catchError(error => {
    console.error('useTokenRates - StatisticsService.getRate', error);
    return of({});
  }),
);

export const [useTokenRates] = bind(tokenRates$, {});
