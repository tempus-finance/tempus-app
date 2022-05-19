import { bind } from '@react-rxjs/core';
import { BigNumber } from 'ethers';
import {
  catchError,
  combineLatest,
  debounce,
  from,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
  switchMap,
} from 'rxjs';
import {
  getServices,
  Decimal,
  StatisticsService,
  Chain,
  Ticker,
  increasePrecision,
  TempusPoolService,
} from 'tempus-core-services';
import { DEFAULT_DECIMAL_PRECISION } from 'tempus-core-services/dist/datastructures';
import { poolList$ } from './useConfig';

const TOKEN_RATE_POLLING_INTERVAL_IN_MS = 30000;
const DEBOUNCE_IN_MS = 500;

interface TokenInfoMap {
  [chainTokenAddressString: string]: {
    chain: Chain;
    token: Ticker;
    address: string;
    conversionRate?: Decimal;
    increasePrecisionAmount?: number;
  };
}

interface TokenRateMap {
  [chainTokenAddressString: string]: Decimal | null;
}

const polling$: Observable<number> = interval(TOKEN_RATE_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const conversionRates$ = poolList$.pipe(
  switchMap(tempusPools =>
    from(
      Promise.all(
        tempusPools.map<Promise<[BigNumber, number]>>(async pool => {
          const backingTokenPrecision = pool.tokenPrecision.backingToken;
          const yieldBearingTokenPrecision = pool.tokenPrecision.yieldBearingToken;

          const poolService = getServices(pool.chain as Chain)?.TempusPoolService as TempusPoolService;
          const interestRate = await poolService.currentInterestRate(pool.address);
          const conversionRate = await poolService.numAssetsPerYieldToken(
            pool.address,
            increasePrecision(BigNumber.from(1), yieldBearingTokenPrecision),
            interestRate,
          );

          const increasePrecisionAmount = DEFAULT_DECIMAL_PRECISION - yieldBearingTokenPrecision;

          if (yieldBearingTokenPrecision > backingTokenPrecision) {
            const precisionDifference = yieldBearingTokenPrecision - backingTokenPrecision;
            return [increasePrecision(conversionRate, precisionDifference), increasePrecisionAmount];
          }

          return [conversionRate, increasePrecisionAmount];
        }),
      ),
    ),
  ),
);

const tokenRates$: Observable<TokenRateMap> = combineLatest([poolList$, conversionRates$, polling$]).pipe(
  mergeMap(([tempusPools, rates]) => {
    const uniqueTokens = Object.values(
      tempusPools.reduce((obj, { chain, backingToken, backingTokenAddress, yieldBearingTokenAddress }, index) => {
        const [conversionRate, increasePrecisionAmount] = rates[index];
        return {
          ...obj,
          [`${chain}-${backingTokenAddress}`]: {
            chain: chain as Chain,
            token: backingToken,
            address: backingTokenAddress,
          },
          [`${chain}-${yieldBearingTokenAddress}`]: {
            chain: chain as Chain,
            token: backingToken,
            address: yieldBearingTokenAddress,
            conversionRate: new Decimal(conversionRate),
            increasePrecisionAmount,
          },
        };
      }, {} as TokenInfoMap),
    );
    const tokenRates = uniqueTokens.map(({ chain, token, address, conversionRate, increasePrecisionAmount }) => {
      // TODO: conceptually chain+ticker is not unique, it should accept chain+address instead
      //       but currently chainlink and gecko API doesnt support that
      const tokenRate = (getServices(chain as Chain)?.StatisticsService as StatisticsService).getRate(
        chain as Chain,
        token,
      );
      return tokenRate.pipe(
        map(rate => {
          const resolvedRate = conversionRate ? rate?.mul(conversionRate) : rate;
          const scaledRate = increasePrecisionAmount
            ? resolvedRate?.mul(increasePrecision(BigNumber.from(1), increasePrecisionAmount))
            : resolvedRate;

          return {
            [`${chain}-${address}`]: scaledRate,
          } as TokenRateMap;
        }),
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
