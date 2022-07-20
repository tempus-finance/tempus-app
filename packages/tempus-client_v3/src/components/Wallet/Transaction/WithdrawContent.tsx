import { FC, memo } from 'react';
import { TransactionData } from '../../../interfaces/Notification';

interface WithdrawContentProps {
  data: TransactionData;
}

const WithdrawContent: FC<WithdrawContentProps> = props => {
  const { data } = props;

  return <div className="tc__wallet-popup__transaction-list__withdraw-content">{data.txnId}</div>;
};

export default memo(WithdrawContent);
