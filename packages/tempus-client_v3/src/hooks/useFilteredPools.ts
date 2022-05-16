import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, filter, from, map, Observable, tap } from 'rxjs';
import { Decimal, TempusPool } from 'tempus-core-services';
import { FilterType, PoolType, SortType, SortOrder } from '../components/Markets/MarketsSubheader';
import { getConfigManager } from '../config/getConfigManager';
import { useFixedApr } from './useFixedApr';

const [poolType$, setPoolType] = createSignal<PoolType>();
const [filterType$, setFilterType] = createSignal<Set<FilterType>>();
const [sortType$, setSortType] = createSignal<SortType>();
const [sortOrder$, setSortOrder] = createSignal<SortOrder>();
const poolList$ = from([getConfigManager().getPoolList()]);

// 'fixed' | 'boosted' | 'all'
const filterByPoolType = ({
  pools,
  filterSet,
  poolType,
  sortType,
  sortOrder,
}: {
  pools: TempusPool[];
  filterSet: Set<FilterType>;
  poolType: PoolType;
  sortType: SortType;
  sortOrder: SortOrder;
}): {
  pools: TempusPool[];
  filterSet: Set<FilterType>;
  sortType: SortType;
  sortOrder: SortOrder;
} => {
  if (poolType === 'all') {
    return { filterSet, pools, sortType, sortOrder };
  }

  return { filterSet, pools, sortType, sortOrder };
  // return { filterSet, sortType, sortOrder, pools: pools.filter(pool => pool.poolType === poolType) };
};

// TODO
// 'active' | 'matured' | 'inactive'
const filterByFilterType = ({
  pools,
  filterSet,
  sortType,
  sortOrder,
}: {
  pools: TempusPool[];
  filterSet: Set<FilterType>;
  sortType: SortType;
  sortOrder: SortOrder;
}): { pools: TempusPool[]; sortType: SortType; sortOrder: SortOrder } => {
  console.log('filterSet', filterSet);
  // no checked is the same as all checked?
  if (filterSet.size === 0) {
    return { pools, sortType, sortOrder };
  }

  // const filteredPools = pools.filter(({ isMatured, isInactive }) => {
  //   let shouldBeIncluded = false;

  //   if (isMatured) {
  //     shouldBeIncluded = shouldBeIncluded || filterSet.has('matured');
  //   }

  //   if (isInactive) {
  //     shouldBeIncluded = shouldBeIncluded || filterSet.has('inactive');
  //   }

  //   if (!isMatured && !isInactive) {
  //     shouldBeIncluded = shouldBeIncluded || filterSet.has('active');
  //   }

  //   return shouldBeIncluded;
  // });

  return {
    // pools: filteredPools,
    pools,
    sortType,
    sortOrder,
  };
};

// TODO
// sort a-z by what?
const sortPools = ({
  pools,
  sortType,
  sortOrder,
}: {
  pools: TempusPool[];
  sortType: SortType;
  sortOrder: SortOrder;
}): TempusPool[] =>
  pools.sort((a, b) => {
    if (sortType === 'a-z') {
      if (sortOrder === 'asc') {
        return a.backingToken < b.backingToken ? -1 : 1;
      }

      return a.backingToken > b.backingToken ? -1 : 1;
    }

    if (sortType === 'maturity') {
      if (sortOrder === 'desc') {
        return a.maturityDate < b.maturityDate ? -1 : 1;
      }

      return a.maturityDate > b.maturityDate ? -1 : 1;
    }

    // if(sortType === 'apr') {}
    // if(sortType === 'tvl') {}
    // if (sortType === 'balance') {}

    return -1;
  });

const pools$: Observable<TempusPool[]> = from(
  combineLatest([poolList$, filterType$, poolType$, sortType$, sortOrder$]),
).pipe(
  filter(([tempusPools]) => tempusPools.length > 0),
  tap(([tempusPools]) => {
    const [, setTempusPool, setTokenAmount] = useFixedApr();
    setTempusPool(tempusPools[0]);
    setTokenAmount(new Decimal('1'));
  }),
  map(([pools, filterSet, poolType, sortType, sortOrder]) => ({
    pools,
    filterSet,
    poolType,
    sortType,
    sortOrder,
  })),
  map(filterByPoolType),
  map(filterByFilterType),
  map(sortPools),
);

const [useFilteredPools] = bind(pools$, []);

export { useFilteredPools, setFilterType, setPoolType, setSortType, setSortOrder };
