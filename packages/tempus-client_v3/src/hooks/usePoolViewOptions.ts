import { bind, state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, map, withLatestFrom } from 'rxjs';
import { useCallback } from 'react';
import { TempusPool, ZERO } from 'tempus-core-services';
import { FilterType, PoolType, SortOrder, SortType, ViewType } from '../interfaces';
import { poolList$ } from './usePoolList';
import { poolTvls$ } from './useTvlData';
import { poolBalancesStream$ } from './usePoolBalance';
import { poolAprs$, PoolFixedAprMap } from './useFixedAprs';

export interface PoolViewOptions {
  viewType: ViewType;
  poolType: PoolType;
  // on UI we only support on filter at a time, keep Set<FilterType> just to prepare to support multiple filters
  filters: Set<FilterType>;
  sortType: SortType;
  sortOrder: SortOrder;
}

const [viewType$, setViewType] = createSignal<ViewType>();
const [poolType$, setPoolType] = createSignal<PoolType>();
const [filters$, setFilters] = createSignal<Set<FilterType>>();
const [sortType$, setSortType] = createSignal<SortType>();
const [sortOrder$, setSortOrder] = createSignal<SortOrder>();

const stateViewType$ = state(viewType$, 'grid');
const statePoolType$ = state(poolType$, 'all');
const stateFilters$ = state(filters$, new Set<FilterType>(['active']));
const stateSortType$ = state(sortType$, 'a-z');
const stateSortOrder$ = state(sortOrder$, 'asc');
const statePoolTvls$ = state(poolTvls$, {});
const statePoolAprs$ = state(poolAprs$, {});
const statePoolBalances$ = state(poolBalancesStream$, []);

export const isPoolMatured = (tempusPool: TempusPool): boolean => tempusPool.maturityDate <= Date.now();
export const isPoolInactive = (tempusPool: TempusPool, poolAprs: PoolFixedAprMap): boolean =>
  !!tempusPool.disabledOperations?.deposit || !!poolAprs[`${tempusPool.chain}-${tempusPool.address}`]?.lt(ZERO);
export const isPoolActive = (tempusPool: TempusPool, poolAprs: PoolFixedAprMap): boolean =>
  !isPoolMatured(tempusPool) && !isPoolInactive(tempusPool, poolAprs);

const activePoolList$ = combineLatest([poolList$, statePoolAprs$]).pipe(
  map(([tempusPools, poolAprs]) => tempusPools.filter(pool => isPoolActive(pool, poolAprs))),
);
const inactivePoolList$ = combineLatest([poolList$, statePoolAprs$]).pipe(
  map(([tempusPools, poolAprs]) => tempusPools.filter(pool => isPoolInactive(pool, poolAprs))),
);
const maturedPoolList$ = poolList$.pipe(map(tempusPools => tempusPools.filter(isPoolMatured)));

const filteredPoolList$ = combineLatest([poolList$, stateFilters$]).pipe(
  // only want to get the latest data instead of getting every interval
  withLatestFrom(statePoolAprs$),
  map(([[tempusPools, filters], poolAprs]) =>
    tempusPools.filter(tempusPool =>
      [...filters].some(filter => {
        switch (filter) {
          case 'active':
          default:
            return isPoolActive(tempusPool, poolAprs);
          case 'inactive':
            return isPoolInactive(tempusPool, poolAprs);
          case 'matured':
            return isPoolMatured(tempusPool);
        }
      }),
    ),
  ),
);
const filteredSortedPoolList$ = combineLatest([filteredPoolList$, stateSortType$, stateSortOrder$]).pipe(
  // only want to get the latest data instead of getting every interval
  withLatestFrom(statePoolTvls$, statePoolAprs$, statePoolBalances$),
  map(([poolData, poolTvls, poolAprs, poolBalances]) => {
    const tempusPools = poolData[0];
    const sortType = poolData[1];
    const sortOrder = poolData[2];

    return (
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
              const poolABalanceData = poolBalances.find(
                poolBalance => poolBalance.chain === poolA.chain && poolBalance.address === poolA.address,
              );
              const poolBBalanceData = poolBalances.find(
                poolBalance => poolBalance.chain === poolB.chain && poolBalance.address === poolB.address,
              );

              const poolBalancesA = poolABalanceData?.balance ?? ZERO;
              const poolBalancesB = poolBBalanceData?.balance ?? ZERO;
              return poolBalancesA.gt(poolBalancesB) ? factor : -1 * factor;
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
        .slice()
    );
  }),
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
