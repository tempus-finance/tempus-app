import { FC, useCallback, useContext, useRef, useState } from 'react';
import {
  CustomTreeData,
  IntegratedSummary,
  IntegratedSorting,
  SummaryState,
  TreeDataState,
  SortingState,
  Sorting,
} from '@devexpress/dx-react-grid';
import { Grid, TableHeaderRow, VirtualTable, TableTreeColumn } from '@devexpress/dx-react-grid-material-ui';
import { ColumnNames, DashboardRow, isChildRow, isParentRow } from '../../interfaces';
import Typography from '../typography/Typography';
import FilterIcon from '../icons/FilterIcon';
import { dashboardColumnsDefinitions } from './dashboardColumnsDefinitions';
import FilterPopup, { FilterData } from './popups/filter-popup';
import TokenButton from './bodySection/tokenButton';
import BodyCellFactory from './bodySection/bodyCellFactory';
import BodyRow from './bodySection/bodyRow';
import HeaderCell from './headerSection/headerCell';
import HeaderRow from './headerSection/headerRow';
import HeaderContent from './headerSection/headerContent';
import MaturityProvider from './providers/maturityProvider';
import TVLProvider from './providers/tvlProvider';
import VariableAPRProvider from './providers/variableAPRProvider';
import AvailableToDepositProvider from './providers/availableToDepositProvider';

import './dashboard.scss';
import { SECONDS_IN_A_DAY } from '../../constants';
import { Context } from '../../context';

type DashboardInProps = {
  hidden: boolean;
  userWalletAddress?: string;
  rows: DashboardRow[];
};

type DashboardOutProps = {
  onRowActionClick: (row: any) => void;
};

type DashboardProps = DashboardInProps & DashboardOutProps;

const Dashboard: FC<DashboardProps> = ({ hidden, userWalletAddress, rows, onRowActionClick }): JSX.Element => {
  const {
    data: { poolData },
  } = useContext(Context);

  const [tableColumnExtensions] = useState([
    { columnName: ColumnNames.TOKEN, align: 'left' as 'left', width: 160 },
    { columnName: ColumnNames.PROTOCOL, align: 'left' as 'left', width: 150 },
    { columnName: ColumnNames.MATURITY, align: 'left' as 'left' },
    { columnName: ColumnNames.FIXED_APR, align: 'right' as 'right', width: 140 },
    { columnName: ColumnNames.VARIABLE_APY, align: 'right' as 'right', width: 160 },
    { columnName: ColumnNames.TVL, align: 'right' as 'right', width: 80 },
    { columnName: ColumnNames.PRESENT_VALUE, align: 'right' as 'right', width: 120 },
    { columnName: ColumnNames.AVAILABLE_TO_DEPOSIT, align: 'right' as 'right', width: 180 },
  ]);

  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const [sortingStateColumnExtensions] = useState([
    { columnName: ColumnNames.AVAILABLE_TO_DEPOSIT, sortingEnabled: false },
  ]);

  const [integratedSortingColumnExtensions] = useState([
    { columnName: ColumnNames.MATURITY, compare: compareMaturity },
    { columnName: ColumnNames.FIXED_APR, compare: compareAPY },
    { columnName: ColumnNames.VARIABLE_APY, compare: compareAPY },
    { columnName: ColumnNames.PROTOCOL, compare: compareProtocol },
  ]);

  const [currentSorting, setCurrentSorting] = useState<Sorting[]>([]);

  const [filterPopupOpen, setFilterPopupOpen] = useState<boolean>(false);
  const [filteredRows, setFilteredRows] = useState<DashboardRow[] | null>(null);

  const filterButtonRef = useRef<HTMLDivElement>(null);

  const onExpandedRowIdsChange = useCallback(
    (expandedRowIds: Array<number | string>) => {
      setExpandedRows(expandedRowIds as number[]);
    },
    [setExpandedRows],
  );

  /**
   * When user clicks on an unsorted column, we want to apply descending sort first, and on the second click ascending sort.
   */
  const onSortingChange = useCallback(
    (sorting: Sorting[]) => {
      const isColumnSortingApplied = (columnName: string, sorting: Sorting[]) => {
        return sorting.findIndex(sortingItem => sortingItem.columnName === columnName) > -1;
      };

      sorting.forEach(sortedColumn => {
        if (!isColumnSortingApplied(sortedColumn.columnName, currentSorting)) {
          sorting[0].direction = 'desc';
        }
      });

      setCurrentSorting(sorting);
    },
    [setCurrentSorting, currentSorting],
  );

  const onToggleFilterPopup = () => {
    setFilterPopupOpen(!filterPopupOpen);
  };

  /**
   * If `null` is passed as `filterData`, all filters will be cleared.
   */
  const onApplyFilter = useCallback(
    (filterData: FilterData | null) => {
      if (!filterData) {
        setFilteredRows(null);
        return;
      }

      let result = rows.filter(row => {
        if (isParentRow(row)) {
          return true;
        }

        // Check asset name matches
        const assetNameMatched = filterData.assetName
          ? row.token.toLowerCase().indexOf(filterData.assetName.toLowerCase()) > -1
          : true;

        // Check protocol name matches
        let protocolNameMatched;
        if (isChildRow(row)) {
          protocolNameMatched = filterData.protocolName
            ? row.protocol.toLowerCase().indexOf(filterData.protocolName.toLowerCase()) > -1
            : true;
        }

        // Check APR matches
        let aprMatched;
        if (isChildRow(row)) {
          const min = filterData.aPRRange.min;
          const max = filterData.aPRRange.max;

          const poolContextData = poolData.find(data => data.address === row.tempusPool.address);
          if (!poolContextData) {
            return true;
          }

          aprMatched =
            (min === 0 || min) && (max === 0 || max)
              ? (row.fixedAPR && row.fixedAPR > min && row.fixedAPR < max) ||
                (poolContextData.variableAPR > min && poolContextData.variableAPR < max)
              : true;
        }

        // Check maturity matches
        let maturityMatched;
        if (isChildRow(row)) {
          const min = filterData.maturityRange.min;
          const max = filterData.maturityRange.max;

          if ((min === 0 || min) && (max === 0 || max)) {
            const startFrom = Date.now() + min * SECONDS_IN_A_DAY * 1000;
            const endTo = Date.now() + max * SECONDS_IN_A_DAY * 1000;

            maturityMatched = row.maturityDate.getTime() > startFrom && row.maturityDate.getTime() < endTo;
          } else {
            maturityMatched = true;
          }
        }

        return assetNameMatched && protocolNameMatched && aprMatched && maturityMatched;
      });

      // Filter out parent rows without children
      result = result.filter(row => {
        if (isChildRow(row)) {
          return true;
        }

        const parentChildren = result.filter(r => {
          return r.parentId !== null && r.parentId === row.id;
        });

        return parentChildren.length > 0;
      });

      setFilteredRows(result);
    },
    [poolData, rows],
  );

  return (
    <div className="tf__dashboard__section__container" hidden={hidden}>
      <div className="tf__dashboard__container">
        <div className="tf__dashboard__header">
          <Typography color="default" variant="h4">
            Available Pools
          </Typography>
          <div className="tf__dashboard__header__actions">
            <div onClick={onToggleFilterPopup} ref={filterButtonRef}>
              <Typography color="default" variant="h4">
                Filter
              </Typography>
              <FilterIcon />
            </div>
            <FilterPopup
              open={filterPopupOpen}
              anchor={filterButtonRef.current}
              onClose={onToggleFilterPopup}
              onFilter={onApplyFilter}
            />
          </div>
        </div>
        <hr />
        <div className="tf__dashboard">
          <div className="tf__dashboard__grid">
            <Grid rows={filteredRows || rows} columns={dashboardColumnsDefinitions}>
              <SortingState
                sorting={currentSorting}
                onSortingChange={onSortingChange}
                columnExtensions={sortingStateColumnExtensions}
              />
              <TreeDataState defaultExpandedRowIds={[]} onExpandedRowIdsChange={onExpandedRowIdsChange} />
              <SummaryState totalItems={totalSummaryItems} treeItems={treeSummaryItems} />
              <MaturityProvider for={[ColumnNames.MATURITY]} />
              <AvailableToDepositProvider for={[ColumnNames.AVAILABLE_TO_DEPOSIT]} />
              <TVLProvider for={[ColumnNames.TVL]} />
              <VariableAPRProvider for={[ColumnNames.VARIABLE_APY]} />
              <CustomTreeData getChildRows={getChildRows} />
              <IntegratedSummary />
              <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
              <VirtualTable
                height="auto"
                columnExtensions={tableColumnExtensions}
                rowComponent={BodyRow}
                cellComponent={BodyCellFactory}
              />
              <TableHeaderRow
                rowComponent={HeaderRow}
                cellComponent={HeaderCell}
                contentComponent={HeaderContent}
                showSortingControls={true}
              />
              <TableTreeColumn
                for={ColumnNames.TOKEN}
                cellComponent={(props: any) => (
                  <TokenButton
                    {...props}
                    expandedRows={expandedRows}
                    isWalletConnected={!!userWalletAddress}
                    actionHandler={onRowActionClick}
                  />
                )}
              />
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const compareMaturity = (a: number[], b: number[]): number => a[0] - b[0];
const compareAPY = (a: number[], b: number[]): number => {
  // Sort children
  if (a.length === 1 && b.length === 1) {
    return a[0] - b[0];
  }

  // Sort parents
  return a[1] - b[1];
};
const compareProtocol = (a: string[] | string, b: string[] | string): number => {
  // Sort child rows
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  // Sort parent rows
  const maxLength = Math.max(a.length, b.length);
  for (let i = 0; i < maxLength; i++) {
    if (a[i] !== b[i]) {
      if (a[i] === undefined) {
        return 1;
      }
      if (b[i] === undefined) {
        return -1;
      }

      if (a[i] > b[i]) {
        return -1;
      } else if (a[i] < b[i]) {
        return 1;
      }
    }
  }
  return 0;
};

const totalSummaryItems = [{ columnName: ColumnNames.TOKEN, type: 'count' }];

const treeSummaryItems = [{ columnName: ColumnNames.TOKEN, type: 'count' }];

const getChildRows = (row: any, rootRows: any) => {
  const childRows = rootRows.filter((r: any) => r.parentId === (row ? row.id : null));
  return childRows.length ? childRows : null;
};
