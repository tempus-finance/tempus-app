import { Column } from '@devexpress/dx-react-grid';

import { fixedAPRTooltipText, variableAPYTooltipText } from '../../constants';
import { DashboardRowChild, DashboardRowParent } from '../../interfaces';
import NumberUtils from '../../services/NumberUtils';

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
    name: 'fixedAPR',
    title: 'Fixed APR',
    tooltip: fixedAPRTooltipText,
    getCellValue: (row: any) => {
      if (row.fixedAPR.length === 2) {
        return row.fixedAPR;
      }
      return [row.fixedAPR];
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
          `${NumberUtils.formatWithMultiplier(row.availableTokensToDeposit.backingToken, 2)} ${
            row.availableTokensToDeposit.backingTokenTicker
          } / ` +
          `${NumberUtils.formatWithMultiplier(row.availableTokensToDeposit.yieldBearingToken, 2)} ${
            row.availableTokensToDeposit.yieldBearingTokenTicker
          }`
        );
      }
    },
  },
];
