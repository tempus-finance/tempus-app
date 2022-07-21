import { FC, memo, useMemo } from 'react';
import TimeAgo from 'javascript-time-ago';
import { useTranslation } from 'react-i18next';
import { TempusPool } from 'tempus-core-services';
import { Accordion, colors } from '../../shared';
import { Notification, TransactionData } from '../../../interfaces/Notification';
import ApproveContent from './ApproveContent';
import DepositContent from './DepositContent';
import WithdrawContent from './WithdrawContent';

interface TransactionItemProps {
  transaction: Notification;
  tempusPool: TempusPool;
}

const TransactionItem: FC<TransactionItemProps> = props => {
  const { transaction, tempusPool } = props;
  const { t } = useTranslation();

  const transactionData = transaction.data as TransactionData;
  const title = useMemo(() => {
    switch (transaction.status) {
      case 'pending': {
        switch (transactionData.transactionType) {
          case 'approve':
            return t('TransactionItem.titleApprovalPending');
          case 'deposit':
            return t('TransactionItem.titleDepositPending');
          case 'withdraw':
            return t('TransactionItem.titleWithdrawalPending');
          default:
            return '';
        }
      }
      case 'failure': {
        switch (transactionData.transactionType) {
          case 'approve':
            return t('TransactionItem.titleApprovalFailed');
          case 'deposit':
            return t('TransactionItem.titleDepositFailed');
          case 'withdraw':
            return t('TransactionItem.titleWithdrawalFailed');
          default:
            return '';
        }
      }
      default:
      case 'success': {
        switch (transactionData.transactionType) {
          case 'approve':
            return t('TransactionItem.titleApprovalSucceed');
          case 'deposit':
            return t('TransactionItem.titleDepositSucceed');
          case 'withdraw':
            return t('TransactionItem.titleWithdrawalSucceed');
          default:
            return '';
        }
      }
    }
  }, [transaction.status, transactionData, t]);
  const subtitle = useMemo(
    // use default locale 'en' here - we dont need translation for this
    () => new TimeAgo().format(transactionData.timestamp as number, 'twitter') as string,
    [transactionData],
  );
  const content = useMemo(() => {
    switch (transactionData.transactionType) {
      case 'approve':
        return <ApproveContent data={transactionData} />;
      case 'deposit':
        return <DepositContent data={transactionData} tempusPool={tempusPool} />;
      case 'withdraw':
        return <WithdrawContent data={transactionData} tempusPool={tempusPool} />;
      default:
        return null;
    }
  }, [transactionData, tempusPool]);

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
    <Accordion title={title} subtitle={subtitle} iconVariant={iconVariant} iconColor={iconColor}>
      {content}
    </Accordion>
  );
};

export default memo(TransactionItem);
