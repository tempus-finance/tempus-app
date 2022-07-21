import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolMap } from '../../../hooks';
import { Notification } from '../../../interfaces/Notification';
import { Typography } from '../../shared';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Notification[];
}

const TransactionList: FC<TransactionListProps> = props => {
  const { transactions } = props;
  const { t } = useTranslation();
  const poolMap = usePoolMap();

  return (
    <div className="tc__wallet-popup__transaction-list">
      {transactions.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          tempusPool={poolMap[`${transaction.chain}-${transaction.data?.poolAddress}`]}
        />
      ))}
      {!transactions.length && (
        <Typography variant="body-secondary">{t('TransactionList.descriptionNoTransactions')}</Typography>
      )}
    </div>
  );
};

export default memo(TransactionList);
