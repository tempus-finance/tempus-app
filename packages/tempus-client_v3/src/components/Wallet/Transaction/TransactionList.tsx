import { FC, memo } from 'react';
import { Notification } from '../../../interfaces/Notification';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Notification[];
}

const TransactionList: FC<TransactionListProps> = props => {
  const { transactions } = props;

  return (
    <div className="tc__wallet-popup__transaction-list">
      {transactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};

export default memo(TransactionList);
