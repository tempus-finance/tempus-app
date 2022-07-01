import { bind, state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, distinctUntilChanged, map, withLatestFrom } from 'rxjs';
import { useCallback } from 'react';
import { TempusPool, ZERO } from 'tempus-core-services';
import { FilterType, PoolType, SortOrder, SortType, ViewType } from '../interfaces';
import { poolList$ } from './usePoolList';
import { poolTvls$ } from './useTvlData';
import { poolBalances$ } from './usePoolBalance';
import { poolAprs$ } from './useFixedAprs';
import { tokenRates$ } from './useTokenRates';
import { negativePoolInterestRateMap$, NegativePoolInterestRatesMap } from './useNegativePoolInterestRate';

export interface PoolViewOptions {
  viewType: ViewType;
  poolType: PoolType;
  // on UI we only support on filter at a time, keep Set<FilterType> just to prepare to support multiple filters
  filters: Set<FilterType>;
  sortType: SortType;
  sortOrder: SortOrder;
}

const [rawViewType$, setViewType] = createSignal<ViewType>();
const [rawPoolType$, setPoolType] = createSignal<PoolType>();
const [rawFilters$, setFilters] = createSignal<Set<FilterType>>();
const [rawSortType$, setSortType] = createSignal<SortType>();
const [rawSortOrder$, setSortOrder] = createSignal<SortOrder>();

const viewType$ = rawViewType$.pipe(distinctUntilChanged());
const poolType$ = rawPoolType$.pipe(distinctUntilChanged());
const filters$ = rawFilters$.pipe(distinctUntilChanged());
const sortType$ = rawSortType$.pipe(distinctUntilChanged());
const sortOrder$ = rawSortOrder$.pipe(distinctUntilChanged());

const stateViewType$ = state(viewType$, 'grid');
const statePoolType$ = state(poolType$, 'all');
const stateFilters$ = state(filters$, new Set<FilterType>(['active']));
const stateSortType$ = state(sortType$, 'a-z');
const stateSortOrder$ = state(sortOrder$, 'asc');
const statePoolTvls$ = state(poolTvls$, {});
const statePoolAprs$ = state(poolAprs$, {});
const statePoolBalances$ = state(poolBalances$, {});
const stateTokenRates$ = state(tokenRates$, {});

export const isPoolMatured = (tempusPool: TempusPool): boolean => tempusPool.maturityDate <= Date.now();
export const isPoolInactive = (
  tempusPool: TempusPool,
  negativePoolInterestRates: NegativePoolInterestRatesMap,
): boolean => {
  const poolChainAddressId = `${tempusPool.chain}-${tempusPool.address}`;

  // Matured pools should not be marked as inactive
  if (isPoolMatured(tempusPool)) {
    return false;
  }

  // Non mature pools with negative interest rate should be marked as inactive
  if (negativePoolInterestRates[poolChainAddressId]) {
    return true;
  }

  return false;
};
export const isPoolActive = (
  tempusPool: TempusPool,
  negativePoolInterestRates: NegativePoolInterestRatesMap,
): boolean => !isPoolMatured(tempusPool) && !isPoolInactive(tempusPool, negativePoolInterestRates);

const activePoolList$ = combineLatest([poolList$, negativePoolInterestRateMap$]).pipe(
  map(([tempusPools, negativePoolInterestRates]) =>
    tempusPools.filter(pool => isPoolActive(pool, negativePoolInterestRates)),
  ),
);
const inactivePoolList$ = combineLatest([poolList$, negativePoolInterestRateMap$]).pipe(
  map(([tempusPools, negativePoolInterestRates]) =>
    tempusPools.filter(pool => isPoolInactive(pool, negativePoolInterestRates)),
  ),
);
const maturedPoolList$ = poolList$.pipe(map(tempusPools => tempusPools.filter(isPoolMatured)));

const filteredPoolList$ = combineLatest([poolList$, stateFilters$]).pipe(
  // only want to get the latest data instead of getting every interval
  withLatestFrom(negativePoolInterestRateMap$),
  map(([[tempusPools, filters], negativePoolInterestRates]) =>
    tempusPools.filter(tempusPool =>
      [...filters].some(filter => {
        switch (filter) {
          case 'active':
          default:
            return isPoolActive(tempusPool, negativePoolInterestRates);
          case 'inactive':
            return isPoolInactive(tempusPool, negativePoolInterestRates);
          case 'matured':
            return isPoolMatured(tempusPool);
        }
      }),
    ),
  ),
);
const filteredSortedPoolList$ = combineLatest([filteredPoolList$, stateSortType$, stateSortOrder$]).pipe(
  // only want to get the latest data instead of getting every interval
  withLatestFrom(statePoolTvls$, statePoolAprs$, statePoolBalances$, stateTokenRates$),
  map(([[tempusPools, sortType, sortOrder], poolTvls, poolAprs, poolBalances, tokenRates]) =>
    tempusPools
      .sort((poolA, poolB) => {
        const factor = sortOrder === 'desc' ? -1 : 1;
        switch (sortType) {
          case 'a-z':
          default:
            return (
              `${poolA.backingToken}--${poolA.protocolDisplayName}`.localeCompare(
                `${poolB.backingToken}--${poolB.protocolDisplayName}`,
              ) * factor
            );
          case 'apr': {
            const aprA = poolAprs[`${poolA.chain}-${poolA.address}`] ?? ZERO;
            const aprB = poolAprs[`${poolB.chain}-${poolB.address}`] ?? ZERO;
            return aprA.gt(aprB) ? factor : -1 * factor;
          }
          case 'balance': {
            const firstPoolTokenRate = tokenRates[`${poolA.chain}-${poolA.backingTokenAddress}`] ?? ZERO;
            const secondPoolTokenRate = tokenRates[`${poolB.chain}-${poolB.backingTokenAddress}`] ?? ZERO;

            const firstPoolBalanceInBT = poolBalances[`${poolA.chain}-${poolA.address}`].balanceInBackingToken ?? ZERO;
            const secondPoolBalanceInBT = poolBalances[`${poolB.chain}-${poolB.address}`].balanceInBackingToken ?? ZERO;

            const firstPoolBalanceInUSD = firstPoolBalanceInBT.mul(firstPoolTokenRate);
            const secondPoolBalanceInUSD = secondPoolBalanceInBT.mul(secondPoolTokenRate);

            return firstPoolBalanceInUSD.gt(secondPoolBalanceInUSD) ? factor : -1 * factor;
          }
          case 'maturity':
            return (poolA.maturityDate - poolB.maturityDate) * factor;
          case 'tvl': {
            const tvlA = poolTvls[`${poolA.chain}-${poolA.address}`] ?? ZERO;
            const tvlB = poolTvls[`${poolB.chain}-${poolB.address}`] ?? ZERO;
            return tvlA.gt(tvlB) ? factor : -1 * factor;
          }
        }
      })
      // .sort() will sort the array in place and return the same reference,
      //   Observable will not emit anything in this case, that's why we need a clone here
      .slice(),
  ),
);

export function usePoolViewOptions(): [PoolViewOptions, (partial: Partial<PoolViewOptions>) => void] {
  const viewType = useStateObservable(stateViewType$);
  const poolType = useStateObservable(statePoolType$);
  const filters = useStateObservable(stateFilters$);
  const sortType = useStateObservable(stateSortType$);
  const sortOrder = useStateObservable(stateSortOrder$);

  const setPartialPoolViewOptions = useCallback((partial: Partial<PoolViewOptions>) => {
    Object.keys(partial).forEach(field => {
      switch (field) {
        case 'viewType':
          if (partial.viewType !== undefined) {
            setViewType(partial.viewType);
          }
          break;
        case 'poolType':
          if (partial.poolType !== undefined) {
            setPoolType(partial.poolType);
          }
          break;
        case 'filters':
          if (partial.filters !== undefined) {
            setFilters(partial.filters);
          }
          break;
        case 'sortType':
          if (partial.sortType !== undefined) {
            setSortType(partial.sortType);
          }
          break;
        case 'sortOrder':
        default:
          if (partial.sortOrder !== undefined) {
            setSortOrder(partial.sortOrder);
          }
          break;
      }
    });
  }, []);

  return [{ viewType, poolType, filters, sortType, sortOrder }, setPartialPoolViewOptions];
}

export const [useFilteredSortedPoolList] = bind(filteredSortedPoolList$, []);
export const [useActivePoolList] = bind(activePoolList$, []);
export const [useInactivePoolList] = bind(inactivePoolList$, []);
export const [useMaturedPoolList] = bind(maturedPoolList$, []);
