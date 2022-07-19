import { FC, memo } from 'react';
import { TransactionData } from '../../../interfaces/Notification';

interface DepositContentProps {
  data: TransactionData;
}

const DepositContent: FC<DepositContentProps> = props => {
  const { data } = props;

  return <div className="tc__wallet-popup__transaction-list__deposit-content">{data.txnId}</div>;
};

export default memo(DepositContent);
