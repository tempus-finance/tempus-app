import { Column } from '@devexpress/dx-react-grid';

import { fixedAPYTooltipText, variableAPYTooltipText } from '../../constants';
import { DashboardRowChild, DashboardRowParent } from '../../interfaces';

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
  },

  {
    name: 'fixedAPY',
    title: 'Fixed APR',
    tooltip: fixedAPYTooltipText,
    getCellValue: (row: any) => {
      if (row.fixedAPY.length === 2) {
        return row.fixedAPY;
      }
      return [row.fixedAPY];
    },
  },
  {
    name: 'variableAPY',
    title: 'Variable APR',
    tooltip: variableAPYTooltipText,
    getCellValue: (row: any) => {
      if (row.variableAPY.length === 2) {
        return row.variableAPY;
      }
      return [row.variableAPY];
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
    name: 'TVL',
    title: 'TVL',
    getCellValue: (row: any) => {
      return row.TVL;
    },
  },
  {
    name: 'presentValue',
    title: 'Present Value',
    getCellValue: (row: any) => {
      if (row.presentValue !== 0 && !row.presentValue) {
        return '-';
      }

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(row.presentValue);
    },
  },
  {
    name: 'availableToDeposit',
    title: 'Avail to Deposit',
    getCellValue: (row: DashboardRowParent | DashboardRowChild) => {
      // Parent row
      if ('availableToDeposit' in row) {
        if (row.availableToDeposit === undefined) {
          return '-';
        }
        return row.availableToDeposit ? 'Yes' : 'No';
      }
      // Child row
      else {
        if (row.availableTokensToDeposit === undefined) {
          return '-';
        }
        return (
          `${row.availableTokensToDeposit.backingToken} ${row.availableTokensToDeposit.backingTokenTicker} / ` +
          `${row.availableTokensToDeposit.yieldBearingToken} ${row.availableTokensToDeposit.yieldBearingTokenTicker}`
        );
      }
    },
  },
];
