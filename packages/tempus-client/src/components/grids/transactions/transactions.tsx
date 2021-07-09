import { Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import transactionsColumnDefinitions from './transactionsColumnDefinitions';

import './transactions.scss';

const Transactions = (): JSX.Element => {
  return (
    <div className="tf-transactions">
      <Typography>Transactions</Typography>
      <div className="tf-transactions-grid">
        <DataGrid rows={rows} columns={transactionsColumnDefinitions} autoHeight={true} hideFooter={true} />
      </div>
    </div>
  );
};
export default Transactions;

// TODO
// get transactions - discuss with Djorje

// TODO
// we need the Financial service for this - BLOCKED
// create a row for each asset => retrieve values with Financial service
const rows: any[] = [
  {
    id: 1,
    pool: 'stETH 3 months 31/12/2021',
    action: 'Deposit',
    totalValue: 262000000,
    account: '0x3090...065d22b',
    time: new Date(),
  },
  {
    id: 2,
    pool: 'stETH 3 months 31/12/2021',
    action: 'Deposit',
    totalValue: 262000000,
    account: '0x3090...065d22b',
    time: new Date('2021-07-14T06:00'),
  },
];
