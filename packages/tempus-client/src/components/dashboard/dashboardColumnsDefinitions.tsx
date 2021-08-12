import { Column } from '@devexpress/dx-react-grid';

import { fixedAPYTooltipText, variableAPYTooltipText } from '../../constants';

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
    getCellValue: (row: any) => {
      if (row.maturity.length === 2) {
        const [min, max] = row.maturity;
        return [min.getTime(), max.getTime()];
      }
      return [row.maturity.getTime()];
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
      return new Intl.NumberFormat().format(row.presentValue);
    },
  },
  {
    name: 'availableToDeposit',
    title: 'Avail to Deposit',
  },
];
