import { FC, useMemo, useState } from 'react';
import { Divider } from '@material-ui/core';
import { format } from 'date-fns';
import { ethers } from 'ethers';
import { UserTransaction } from '../../../../adapters/PoolDataAdapter';
import { TransactionAction } from '../../../../interfaces';
import { isDepositEvent, isRedeemEvent } from '../../../../services/EventUtils';
import NumberUtils from '../../../../services/NumberUtils';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';

interface DetailUserInfoTransactionRowProps {
  transaction: UserTransaction;
}

const DetailUserInfoTransactionRow: FC<DetailUserInfoTransactionRowProps> = props => {
  const { transaction } = props;

  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [type, setType] = useState<TransactionAction | ''>('');
  const [value, setValue] = useState<string>('');

  useMemo(() => {
    const transactionDate = new Date(transaction.block.timestamp * 1000);

    setDate(format(transactionDate, 'dd LLL, yyyy'));
    setTime(format(transactionDate, 'hh:mm:ss aa'));

    if (isDepositEvent(transaction.event)) {
      setType('Deposit');
    } else if (isRedeemEvent(transaction.event)) {
      setType('Redemption');
    }

    setValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(transaction.usdValue)));
  }, [transaction]);

  return (
    <>
      <Divider />
      <Spacer size={14} />
      <div className="tf__detail__user_info__transaction-info">
        <div className="tf__detail__user_info__transaction-info-date">
          <Typography variant="body-text">{date}</Typography>
          <Typography variant="disclaimer-text">{time}</Typography>
        </div>
        <div className="tf__detail__user_info__transaction-info-type">
          <Typography variant="body-text">{type}</Typography>
        </div>
        <div className="tf__detail__user_info__transaction-info-balance">
          <Typography variant="body-text">${value}</Typography>
        </div>
      </div>
      <Spacer size={16} />
    </>
  );
};
export default DetailUserInfoTransactionRow;
