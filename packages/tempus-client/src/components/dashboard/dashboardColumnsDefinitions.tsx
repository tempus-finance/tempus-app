import { Column } from '@devexpress/dx-react-grid';
import { ethers } from 'ethers';

import { fixedAPRTooltipText, variableAPYTooltipText } from '../../constants';
import { DashboardRow, DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces';
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
    getCellValue: (row: DashboardRowChild | DashboardRowParent) => {
      if (isParentRow(row)) {
        return row.protocols;
      } else {
        return row.protocol;
      }
    },
  },

  {
    name: 'fixedAPR',
    title: `Fixed APR`,
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
    title: 'Balance',
    tooltip: 'Waiting for text...',
    getCellValue: (row: DashboardRow) => {
      if (!row.presentValue) {
        return '-';
      }

      return `$${NumberUtils.formatWithMultiplier(Number(ethers.utils.formatEther(row.presentValue)), 2)}`;
    },
  },
  {
    name: 'availableToDeposit',
    title: 'Available to Deposit',
    getCellValue: (row: DashboardRowParent | DashboardRowChild) => {
      // Parent row
      if ('protocols' in row) {
        if (row.availableUSDToDeposit === undefined) {
          return '-';
        }

        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(row.availableUSDToDeposit.toBigInt());
      }
      // Child row
      else {
        if (row.availableTokensToDeposit === undefined) {
          return '-';
        }
        return (
          `${NumberUtils.formatWithMultiplier(
            Number(ethers.utils.formatEther(row.availableTokensToDeposit.backingToken)),
            2,
          )} ${row.availableTokensToDeposit.backingTokenTicker} / ` +
          `${NumberUtils.formatWithMultiplier(
            Number(ethers.utils.formatEther(row.availableTokensToDeposit.yieldBearingToken)),
            2,
          )} ${row.availableTokensToDeposit.yieldBearingTokenTicker}`
        );
      }
    },
  },
];
