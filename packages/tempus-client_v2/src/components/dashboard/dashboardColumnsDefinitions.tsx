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
    getCellValue: row => {
      if (row.maturityRange && row.maturityRange.length === 2) {
        const [min, max] = row.maturityRange;
        if (min.getTime() === max.getTime()) {
          return [min.getTime()];
        }

        return [min.getTime(), max.getTime()];
      }
      return [row.maturityDate.getTime()];
    },
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
