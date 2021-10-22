import { ethers } from 'ethers';
import { Column } from '@devexpress/dx-react-grid';
import { DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces';
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
