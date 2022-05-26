import { bind, state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, map, withLatestFrom } from 'rxjs';
import { useCallback } from 'react';
import { TempusPool, ZERO } from 'tempus-core-services';
import { FilterType, PoolType, SortOrder, SortType, ViewType } from '../interfaces';
import { poolList$ } from './useConfig';
import { poolTvls$ } from './useTvlData';
import { poolBalances$ } from './usePoolBalances';

export interface PoolViewOptions {
  viewType: ViewType;
  poolType: PoolType;
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
const statePoolBalances$ = state(poolBalances$, {});

export const isPoolMatured = (tempusPool: TempusPool): boolean => tempusPool.maturityDate <= Date.now();
// TODO: check other operations, and check whether it's -ve APR
export const isPoolInactive = (tempusPool: TempusPool): boolean => !!tempusPool.disabledOperations?.deposit;
export const isPoolActive = (tempusPool: TempusPool): boolean =>
  !isPoolMatured(tempusPool) && !isPoolInactive(tempusPool);

const activePoolList$ = poolList$.pipe(map(tempusPools => tempusPools.filter(isPoolActive)));
const inactivePoolList$ = poolList$.pipe(map(tempusPools => tempusPools.filter(isPoolInactive)));
const maturedPoolList$ = poolList$.pipe(map(tempusPools => tempusPools.filter(isPoolMatured)));

const filteredPoolList$ = combineLatest([poolList$, stateFilters$]).pipe(
  map(([tempusPools, filters]) =>
    tempusPools.filter(tempusPool =>
      [...filters].some(filter => {
        switch (filter) {
          case 'active':
          default:
            return isPoolActive(tempusPool);
          case 'inactive':
            return isPoolInactive(tempusPool);
          case 'matured':
            return isPoolMatured(tempusPool);
        }
      }),
    ),
  ),
);
const filteredSortedPoolList$ = combineLatest([filteredPoolList$, stateSortType$, stateSortOrder$]).pipe(
  withLatestFrom(statePoolTvls$, statePoolBalances$), // only want to get the latest data instead of getting every interval
  map(([[tempusPools, sortType, sortOrder], poolTvls, poolBalances]) =>
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
          case 'apr':
            return 0; // TODO: need to get the APR to compare
          case 'balance': {
            const poolBalancesA = poolBalances[`${poolA.chain}-${poolA.address}`] ?? ZERO;
            const poolBalancesB = poolBalances[`${poolB.chain}-${poolB.address}`] ?? ZERO;
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
