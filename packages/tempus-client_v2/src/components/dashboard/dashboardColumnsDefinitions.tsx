import { Column } from '@devexpress/dx-react-grid';
import { DashboardRowChild, DashboardRowParent, isParentRow } from '../../interfaces/DashboardRow';
import { Locale } from '../../interfaces/Locale';
import getText from '../../localisation/getText';

export interface ExtraDataColumn extends Column {
  tooltip?: string;
}

export const dashboardColumnsDefinitions = (isConnected: boolean, locale: Locale): ExtraDataColumn[] => {
  const defaultColumnsDefinitions = [
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
  ];
  const connectedColumnsDefinitions = [
    {
      name: 'presentValue',
      title: getText('balance', locale),
    },
    {
      name: 'availableToDeposit',
      title: getText('availableToDeposit', locale),
    },
  ];
  // if unconnected, show empty column header
  const unconnectedColumnsDefinitions = [
    {
      name: 'presentValue',
      title: ' ',
    },
    {
      name: 'availableToDeposit',
      title: ' ',
    },
  ];

  return isConnected
    ? defaultColumnsDefinitions.concat(connectedColumnsDefinitions)
    : defaultColumnsDefinitions.concat(unconnectedColumnsDefinitions);
};
