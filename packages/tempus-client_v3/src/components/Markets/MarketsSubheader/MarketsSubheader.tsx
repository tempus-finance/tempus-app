import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  DropdownRadioItem,
  DropdownSelectableItem,
  DropdownSelector,
  NavSubheader,
  NavSubheaderGroup,
  Tab,
  Tabs,
} from '../../shared';
import { FilterType, PoolType, SortOrder, SortType } from '../../../interfaces';
import {
  usePoolViewOptions,
  useActivePoolList,
  useInactivePoolList,
  useMaturedPoolList,
  useSelectedChain,
} from '../../../hooks';

const MarketsSubheader = () => {
  const { t } = useTranslation();
  const [poolViewOptions, setPoolViewOptions] = usePoolViewOptions();
  const selectedChain = useSelectedChain();
  const activePoolList = useActivePoolList();
  const inactivePoolList = useInactivePoolList();
  const maturedPoolList = useMaturedPoolList();
  const { poolType, filters, sortType, sortOrder } = poolViewOptions;

  const chainActivePoolList = useMemo(
    () => activePoolList.filter(pool => !selectedChain || pool.chain === selectedChain),
    [selectedChain, activePoolList],
  );
  const chainInactivePoolList = useMemo(
    () => inactivePoolList.filter(pool => !selectedChain || pool.chain === selectedChain),
    [selectedChain, inactivePoolList],
  );
  const chainMaturedPoolList = useMemo(
    () => maturedPoolList.filter(pool => !selectedChain || pool.chain === selectedChain),
    [selectedChain, maturedPoolList],
  );

  const handlePoolTypeChange = useCallback(
    (type: PoolType) => setPoolViewOptions({ poolType: type }),
    [setPoolViewOptions],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      const updatedFilters = new Set<FilterType>([value] as FilterType[]);
      setPoolViewOptions({ filters: updatedFilters });
    },
    [setPoolViewOptions],
  );

  const handleSortTypeChange = useCallback(
    (updatedSortType: SortType) => {
      let order: SortOrder;

      if (sortType === updatedSortType) {
        order = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        order = 'asc';
      }

      setPoolViewOptions({ sortOrder: order, sortType: updatedSortType });
    },
    [sortOrder, sortType, setPoolViewOptions],
  );

  return (
    <NavSubheader>
      <NavSubheaderGroup>
        <Tabs size="small" value={poolType} onTabSelected={handlePoolTypeChange}>
          <Tab label={t('MarketsSubheader.tabFixed')} value="fixed" />
          <Tab label={t('MarketsSubheader.tabBoosted')} value="boosted" />
          <Tab label={t('MarketsSubheader.tabAll')} value="all" />
        </Tabs>
      </NavSubheaderGroup>
      <NavSubheaderGroup>
        <Dropdown label={t('MarketsSubheader.optionFilter')}>
          <DropdownRadioItem
            label={t('MarketsSubheader.filterActive', { numOfPool: chainActivePoolList.length })}
            value="active"
            checked={filters.has('active')}
            onChange={handleFilterChange}
          />
          <DropdownRadioItem
            label={t('MarketsSubheader.filterMatured', { numOfPool: chainMaturedPoolList.length })}
            value="matured"
            checked={filters.has('matured')}
            onChange={handleFilterChange}
          />
          <DropdownRadioItem
            label={t('MarketsSubheader.filterInactive', { numOfPool: chainInactivePoolList.length })}
            value="inactive"
            checked={filters.has('inactive')}
            onChange={handleFilterChange}
          />
        </Dropdown>
        <DropdownSelector
          label={t('MarketsSubheader.optionSort')}
          itemIcon={sortOrder === 'asc' ? 'up-arrow-thin' : 'down-arrow-thin'}
          selectedValue={sortType}
          onSelect={handleSortTypeChange}
        >
          <DropdownSelectableItem label={t('MarketsSubheader.sortAZ')} value="a-z" />
          <DropdownSelectableItem label={t('MarketsSubheader.sortMaturity')} value="maturity" />
          <DropdownSelectableItem label={t('MarketsSubheader.sortTVL')} value="tvl" />
          <DropdownSelectableItem label={t('MarketsSubheader.sortAPR')} value="apr" />
          <DropdownSelectableItem label={t('MarketsSubheader.sortBalance')} value="balance" />
        </DropdownSelector>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};

export default memo(MarketsSubheader);
