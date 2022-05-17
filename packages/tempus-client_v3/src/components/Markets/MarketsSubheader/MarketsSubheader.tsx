import { FC, useCallback, useState } from 'react';
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
import { FilterType, PoolType, SortOrder, SortType, ViewType } from '../../../interfaces';

export interface MarketsSubheaderProps {
  onPoolTypeChange?: (poolType: PoolType) => void;
  onViewTypeChange?: (viewType: ViewType) => void;
  onFilterChange?: (filters: Set<FilterType>) => void;
  onSortTypeChange?: (sortType: SortType, sortOrder: SortOrder) => void;
}

const MarketsSubheader: FC<MarketsSubheaderProps> = props => {
  const { onPoolTypeChange, onViewTypeChange, onFilterChange, onSortTypeChange } = props;
  const { t } = useTranslation();
  const [poolType, setPoolType] = useState<PoolType>('all');
  const [filters, setFilters] = useState(new Set<FilterType>());
  const [sortType, setSortType] = useState<SortType>('a-z');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handlePoolTypeChange = useCallback(
    (pool: PoolType) => {
      setPoolType(pool);
      onPoolTypeChange?.(pool);
    },
    [onPoolTypeChange],
  );

  const handleViewTypeChange = useCallback(
    (iconType: IconVariant) => {
      if (iconType === 'grid-view') {
        onViewTypeChange?.('grid');
      } else if (iconType === 'list-view') {
        onViewTypeChange?.('list');
      }
    },
    [onViewTypeChange],
  );

  const handleFilterChange = useCallback(
    (checked: boolean, value: string) => {
      const updatedFilters = new Set(filters);

      if (checked) {
        updatedFilters.add(value as FilterType);
      } else {
        updatedFilters.delete(value as FilterType);
      }

      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
    },
    [filters, onFilterChange],
  );

  const handleSortTypeChange = useCallback(
    (updatedSortType: SortType) => {
      let order: SortOrder;

      if (sortType === updatedSortType) {
        order = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        order = 'asc';
      }

      setSortType(updatedSortType);
      setSortOrder(order);
      onSortTypeChange?.(updatedSortType, order);
    },
    [onSortTypeChange, sortOrder, sortType],
  );

  return (
    <NavSubheader>
      <NavSubheaderGroup>
        <Tabs size="small" value={poolType} onTabSelected={handlePoolTypeChange}>
          <Tab label={t('MarketsSubheader.tabFixed')} value="fixed" />
          <Tab label={t('MarketsSubheader.tabBoosted')} value="boosted" />
          <Tab label={t('MarketsSubheader.tabAll')} value="all" />
        </Tabs>
        <IconButtonGroup types={['grid-view', 'list-view']} onChange={handleViewTypeChange} />
      </NavSubheaderGroup>
      <NavSubheaderGroup>
        <Dropdown label={t('MarketsSubheader.optionFilter')}>
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterActive')}
            value="active"
            onChange={handleFilterChange}
          />
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterMatured')}
            value="matured"
            onChange={handleFilterChange}
          />
          <DropdownCheckboxItem
            label={t('MarketsSubheader.filterInactive')}
            value="inactive"
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

export default MarketsSubheader;
