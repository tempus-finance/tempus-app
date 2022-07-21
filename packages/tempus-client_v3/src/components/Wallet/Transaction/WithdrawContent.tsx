import { FC, memo } from 'react';
import { TempusPool } from 'tempus-core-services';
import { TransactionData } from '../../../interfaces/Notification';

interface WithdrawContentProps {
  data: TransactionData;
  tempusPool: TempusPool;
}

const WithdrawContent: FC<WithdrawContentProps> = props => {
  const { data, tempusPool } = props;
  console.log(tempusPool);

  return <div className="tc__wallet-popup__transaction-list__withdraw-content">{data.txnId}</div>;
};

export default memo(WithdrawContent);
