import { Column } from '@devexpress/dx-react-grid';
import { DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces/DashboardRow';
import getText, { Language } from '../../localisation/getText';

export interface ExtraDataColumn extends Column {
  tooltip?: string;
}

export const dashboardColumnsDefinitions = (language: Language): ExtraDataColumn[] => [
  {
    name: 'token',
    title: getText('asset', language),
  },
  {
    name: 'protocol',
    title: getText('protocol', language),
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
    title: getText('maturity', language),
  },
  {
    name: 'fixedAPR',
    title: getText('fixedApr', language),
  },
  // {
  //   name: 'variableAPY',
  //   title: getText('lpApr', language),
  // },
  {
    name: 'TVL',
    title: getText('tvl', language),
  },
  {
    name: 'presentValue',
    title: getText('balance', language),
  },
  {
    name: 'availableToDeposit',
    title: getText('availableToDeposit', language),
  },
];
