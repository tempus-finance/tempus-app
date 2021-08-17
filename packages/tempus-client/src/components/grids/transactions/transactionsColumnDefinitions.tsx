import { GridValueGetterParams } from '@material-ui/data-grid';
import { formatDistanceToNow } from 'date-fns';
import NumberUtils from '../../../services/NumberUtils';

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
    valueGetter: (params: GridValueGetterParams) => `${NumberUtils.formatWithMultiplier(params.row.totalValue, 2)}`,
    flex: 1,
  },
  {
    field: 'account',
    headerName: 'Account',
    flex: 1,
  },
  {
    field: 'time',
    headerName: 'Time',
    valueGetter: (params: GridValueGetterParams) => `${formatDistanceToNow(params.row.time)}`,
    flex: 1,
  },
];

export default transactionsColumnDefinitions;
