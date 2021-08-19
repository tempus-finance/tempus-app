import { GridValueGetterParams } from '@material-ui/data-grid';
import format from 'date-fns/format';

const transactionsColumnDefinitions = [
  {
    field: 'pool',
    headerName: 'Pool',
    flex: 1,
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
  },
  {
    field: 'totalValue',
    headerName: 'Total Value',
    type: 'number',
    valueGetter: (params: GridValueGetterParams) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(params.row.totalValue);
    },
    flex: 0.5,
  },
  {
    field: 'account',
    headerName: 'Account',
    flex: 1.5,
  },
  {
    field: 'time',
    headerName: 'Time',
    valueGetter: (params: GridValueGetterParams) => format(params.row.time, 'MMM dd, yyyy, h:mm:ss a'),
    flex: 1,
  },
];

export default transactionsColumnDefinitions;
