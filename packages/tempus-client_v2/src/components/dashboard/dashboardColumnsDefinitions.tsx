import { Column } from '@devexpress/dx-react-grid';
import { DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces/DashboardRow';

export interface ExtraDataColumn extends Column {
  tooltip?: string;
}

export const dashboardColumnsDefinitions: ExtraDataColumn[] = [
  {
    name: 'token',
    title: 'Asset',
  },
  {
    name: 'protocol',
    title: 'Protocol',
    // TODO - Hide protocol icons from children that are hidden
    getCellValue: (row: DashboardRowChild | DashboardRowParent) => {
      if (isParentRow(row)) {
        return row.protocols;
      } else {
        return row.tempusPool.protocol;
      }
    },
  },
  {
    name: 'maturity',
    title: 'Maturity',
  },
  {
    name: 'fixedAPR',
    title: `Fixed APR`,
  },
  {
    name: 'variableAPY',
    title: 'LP APR',
  },
  {
    name: 'TVL',
    title: 'TVL',
  },
  {
    name: 'presentValue',
    title: 'Balance',
  },
  {
    name: 'availableToDeposit',
    title: 'Available to Deposit',
  },
];
