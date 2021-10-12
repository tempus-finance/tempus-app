import { useContext, useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { Context } from '../../../context';
import getTransactionsDataAdapter from '../../../adapters/getTransactionsDataAdapter';
import { Transaction } from '../../../interfaces';
import transactionsColumnDefinitions from './transactionsColumnDefinitions';

import './transactions.scss';

const Transactions = (): JSX.Element => {
  const {
    data: { userWalletSigner },
  } = useContext(Context);

  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const dataAdapter = getTransactionsDataAdapter(userWalletSigner || undefined);

      const data = await dataAdapter.generateData();
      setTransactions(data);
      setLoading(false);
    };
    fetchTransactions();
    setLoading(true);
  }, [userWalletSigner]);

  return (
    <div className="tf__transactions">
      <Typography>Transactions</Typography>
      <div className="tf__transactions-grid">
        {loading && (
          <div className="tf__transactions-loading-overlay">
            <CircularProgress size={48} />
          </div>
        )}
        <DataGrid rows={transactions} columns={transactionsColumnDefinitions} autoHeight={true} hideFooter={true} />
      </div>
    </div>
  );
};
export default Transactions;
