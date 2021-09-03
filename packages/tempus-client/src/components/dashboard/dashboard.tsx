import { FC, useCallback, useState } from 'react';
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
import { ColumnNames, DashboardRow } from '../../interfaces';
import { dashboardColumnsDefinitions } from './dashboardColumnsDefinitions';
import TokenButton from './bodySection/tokenButton';
import BodyCellFactory from './bodySection/bodyCellFactory';
import BodyRow from './bodySection/bodyRow';
import HeaderCell from './headerSection/headerCell';
import HeaderRow from './headerSection/headerRow';
import HeaderContent from './headerSection/headerContent';
import MaturityProvider from './providers/maturityProvider';
import TVLProvider from './providers/tvlProvider';

import './dashboard.scss';

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
  const [tableColumnExtensions] = useState([
    { columnName: ColumnNames.TOKEN, align: 'left' as 'left', width: 120 },
    { columnName: ColumnNames.PROTOCOL, align: 'center' as 'center', width: 120 },
    { columnName: ColumnNames.MATURITY, align: 'right' as 'right' },
    { columnName: ColumnNames.FIXED_APR, align: 'right' as 'right', width: 140 },
    { columnName: ColumnNames.VARIABLE_APY, align: 'right' as 'right', width: 160 },
    { columnName: ColumnNames.TVL, align: 'right' as 'right', width: 80 },
    { columnName: ColumnNames.PRESENT_VALUE, align: 'right' as 'right', width: 135 },
    { columnName: ColumnNames.AVAILABLE_TO_DEPOSIT, align: 'right' as 'right', width: 150 },
  ]);

  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const [sortingStateColumnExtensions] = useState([
    { columnName: ColumnNames.AVAILABLE_TO_DEPOSIT, sortingEnabled: false },
  ]);

  const [integratedSortingColumnExtensions] = useState([
    { columnName: ColumnNames.MATURITY, compare: compareMaturity },
    { columnName: ColumnNames.FIXED_APR, compare: compareAPY },
    { columnName: ColumnNames.VARIABLE_APY, compare: compareAPY },
  ]);

  const [currentSorting, setCurrentSorting] = useState<Sorting[]>([]);

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

  return (
    <div className="tf__dashboard__section__container" hidden={hidden}>
      <div className="tf__dashboard__container">
        <div className="tf__dashboard">
          <div className="tf__dashboard__grid">
            <Grid rows={rows} columns={dashboardColumnsDefinitions}>
              <SortingState
                sorting={currentSorting}
                onSortingChange={onSortingChange}
                columnExtensions={sortingStateColumnExtensions}
              />
              <TreeDataState defaultExpandedRowIds={[]} onExpandedRowIdsChange={onExpandedRowIdsChange} />
              <SummaryState totalItems={totalSummaryItems} treeItems={treeSummaryItems} />
              <MaturityProvider for={[ColumnNames.MATURITY]} />
              <TVLProvider for={[ColumnNames.TVL]} />
              <CustomTreeData getChildRows={getChildRows} />
              <IntegratedSummary />
              <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
              <VirtualTable
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

const compareMaturity = (a: number[], b: number[]) => a[0] - b[0];
const compareAPY = (a: number[], b: number[]) => a[1] - b[1];

const totalSummaryItems = [{ columnName: ColumnNames.TOKEN, type: 'count' }];

const treeSummaryItems = [{ columnName: ColumnNames.TOKEN, type: 'count' }];

const getChildRows = (row: any, rootRows: any) => {
  const childRows = rootRows.filter((r: any) => r.parentId === (row ? row.id : null));
  return childRows.length ? childRows : null;
};
