import { FC, memo, useMemo } from 'react';
import { Accordion, colors } from '../../shared';
import { Notification, TransactionData } from '../../../interfaces/Notification';
import ApproveContent from './ApproveContent';
import DepositContent from './DepositContent';
import WithdrawContent from './WithdrawContent';

interface TransactionItemProps {
  transaction: Notification;
}

const TransactionItem: FC<TransactionItemProps> = props => {
  const { transaction } = props;

  const transactionData = transaction.data as TransactionData;
  const title = transactionData.transactionType;
  const content = useMemo(() => {
    switch (transactionData.transactionType) {
      case 'approve':
        return <ApproveContent data={transactionData} />;
      case 'deposit':
        return <DepositContent data={transactionData} />;
      case 'withdraw':
        return <WithdrawContent data={transactionData} />;
      default:
        return null;
    }
  }, [transactionData]);

  const iconVariant = useMemo(() => {
    switch (transaction.status) {
      case 'pending':
        return 'pending';
      case 'failure':
        return 'exclamation-error';
      default:
      case 'success':
        return 'checkmark';
    }
  }, [transaction.status]);
  const iconColor = useMemo(() => {
    switch (transaction.status) {
      default:
      case 'pending':
        return undefined;
      case 'failure':
        return colors.textError;
      case 'success':
        return colors.textSuccess;
    }
  }, [transaction.status]);

  return (
    <Accordion title={title} iconVariant={iconVariant} iconColor={iconColor}>
      {content}
    </Accordion>
  );
};

export default memo(TransactionItem);
