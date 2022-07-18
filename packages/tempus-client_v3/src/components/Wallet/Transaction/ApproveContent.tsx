import { FC, memo } from 'react';
import { TransactionData } from '../../../interfaces/Notification';

interface ApproveContentProps {
  data: TransactionData;
}

const ApproveContent: FC<ApproveContentProps> = props => {
  const { data } = props;

  return <div className="tc__wallet-popup__transaction-list__approve-content">{data.txnId}</div>;
};

export default memo(ApproveContent);
