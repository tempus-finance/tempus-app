import { FC, useCallback, useState } from 'react';
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

export type PoolType = 'fixed' | 'boosted' | 'all';
export type ViewType = 'grid' | 'list';
export type FilterType = 'active' | 'matured' | 'inactive';
export type SortType = 'a-z' | 'maturity' | 'tvl' | 'apr' | 'balance';
export type SortOrder = 'asc' | 'desc';

export interface MarketsSubheaderProps {
  onPoolTypeChange?: (poolType: PoolType) => void;
  onViewTypeChange?: (viewType: ViewType) => void;
  onFilterChange?: (filters: Set<FilterType>) => void;
  onSortTypeChange?: (sortType: SortType, sortOrder: SortOrder) => void;
}

const MarketsSubheader: FC<MarketsSubheaderProps> = props => {
  const { onPoolTypeChange, onViewTypeChange, onFilterChange, onSortTypeChange } = props;
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
          <Tab label="Fixed" value="fixed" />
          <Tab label="Boosted" value="boosted" />
          <Tab label="All" value="all" />
        </Tabs>
        <IconButtonGroup types={['grid-view', 'list-view']} onChange={handleViewTypeChange} />
      </NavSubheaderGroup>
      <NavSubheaderGroup>
        <Dropdown label="Filter">
          <DropdownCheckboxItem label="Active #" value="active" onChange={handleFilterChange} />
          <DropdownCheckboxItem label="Matured #" value="matured" onChange={handleFilterChange} />
          <DropdownCheckboxItem label="Inactive #" value="inactive" onChange={handleFilterChange} />
        </Dropdown>
        <DropdownSelector
          label="Sort"
          itemIcon={sortOrder === 'asc' ? 'down-arrow-thin' : 'up-arrow-thin'}
          selectedValue={sortType}
          onSelect={handleSortTypeChange}
        >
          <DropdownSelectableItem label="A-Z" value="a-z" />
          <DropdownSelectableItem label="Maturity" value="maturity" />
          <DropdownSelectableItem label="TVL" value="tvl" />
          <DropdownSelectableItem label="APR %" value="apr" />
          <DropdownSelectableItem label="Balance" value="balance" />
        </DropdownSelector>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};

export default MarketsSubheader;
