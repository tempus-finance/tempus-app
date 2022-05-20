import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownSelectableItem,
  DropdownSelector,
  IconButtonGroup,
  IconVariant,
  NavSubheader,
  NavSubheaderGroup,
  Tab,
  Tabs,
} from '../../shared';
import { FilterType, PoolType, SortOrder, SortType } from '../../../interfaces';
import { usePoolViewOptions } from '../../../hooks';

const MarketsSubheader = () => {
  const { t } = useTranslation();
  const [poolViewOptions, setPoolViewOptions] = usePoolViewOptions();
  const { viewType, poolType, filters, sortType, sortOrder } = poolViewOptions;

  const handleViewTypeChange = useCallback(
    (iconVariant: IconVariant) => {
      switch (iconVariant) {
        case 'list-view':
          setPoolViewOptions({ viewType: 'list' });
          break;
        case 'grid-view':
        default:
          setPoolViewOptions({ viewType: 'grid' });
          break;
      }
    },
    [setPoolViewOptions],
  );

  const handlePoolTypeChange = useCallback(
    (type: PoolType) => setPoolViewOptions({ poolType: type }),
    [setPoolViewOptions],
  );

  const handleFilterChange = useCallback(
    (checked: boolean, value: string) => {
      const updatedFilters = new Set(filters);

      if (checked) {
        updatedFilters.add(value as FilterType);
      } else {
        updatedFilters.delete(value as FilterType);
      }

      setPoolViewOptions({ filters: updatedFilters });
    },
    [filters, setPoolViewOptions],
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
        <IconButtonGroup
          variants={['grid-view', 'list-view']}
          selectedVariant={`${viewType}-view`}
          onChange={handleViewTypeChange}
        />
      </NavSubheaderGroup>
      <NavSubheaderGroup>
        <Dropdown label={t('MarketsSubheader.optionFilter')}>
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterActive')}
            value="active"
            checked={filters.has('active')}
            onChange={handleFilterChange}
          />
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterMatured')}
            value="matured"
            checked={filters.has('matured')}
            onChange={handleFilterChange}
          />
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterInactive')}
            value="inactive"
            checked={filters.has('inactive')}
            onChange={handleFilterChange}
          />
        </Dropdown>
        <DropdownSelector
          label={t('MarketsSubheader.optionSort')}
          itemIcon={sortOrder === 'asc' ? 'down-arrow-thin' : 'up-arrow-thin'}
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
