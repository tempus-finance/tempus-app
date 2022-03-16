import { Column } from '@devexpress/dx-react-grid';
import { DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces/DashboardRow';
import { Locale } from '../../interfaces/Locale';
import getText from '../../localisation/getText';

export interface ExtraDataColumn extends Column {
  tooltip?: string;
}

export const dashboardColumnsDefinitions = (locale: Locale): ExtraDataColumn[] => [
  {
    name: 'token',
    title: getText('asset', locale),
  },
  {
    name: 'protocol',
    title: getText('protocol', locale),
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
    title: getText('maturity', locale),
  },
  {
    name: 'fixedAPR',
    title: getText('fixedApr', locale),
  },
  // {
  //   name: 'variableAPY',
  //   title: getText('lpApr', locale),
  // },
  {
    name: 'TVL',
    title: getText('tvl', locale),
  },
  {
    name: 'presentValue',
    title: getText('balance', locale),
  },
  {
    name: 'availableToDeposit',
    title: getText('availableToDeposit', locale),
  },
];
