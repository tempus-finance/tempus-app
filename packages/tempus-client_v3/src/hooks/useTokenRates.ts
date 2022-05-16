import { bind } from '@react-rxjs/core';
import { catchError, debounce, interval, map, merge, mergeMap, Observable, of, scan, startWith } from 'rxjs';
import { getServices, Decimal, StatisticsService, TempusPool, Chain } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const TOKEN_RATE_POLLING_INTERVAL_IN_MS = 30000;
const DEBOUNCE_IN_MS = 1000;

interface TokenRateMap {
  [x: string]: Decimal | null;
}

const tokenRates$: Observable<TokenRateMap> = interval(TOKEN_RATE_POLLING_INTERVAL_IN_MS).pipe(
  startWith(0),
  map(() => getConfigManager().getPoolList()),
  mergeMap<TempusPool[], Observable<TokenRateMap>>((tempusPools: TempusPool[]) => {
    const unqiueTokenSet = new Set(
      tempusPools
        .map(({ chain, backingToken, yieldBearingToken }) => [
          {
            chain: chain as Chain,
            token: backingToken,
          },
          {
            chain: chain as Chain,
            token: yieldBearingToken,
          },
        ])
        .flat(),
    );
    const tokenRates = [...unqiueTokenSet].map(({ chain, token }) => {
      const tokenRate = (getServices(chain as Chain)?.StatisticsService as StatisticsService).getRate(
        chain as Chain,
        token,
      );
      return tokenRate.pipe(
        map(
          rate =>
            ({
              [`${chain}-${token}`]: rate,
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
