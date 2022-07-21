import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../../hooks';
import { TransactionData } from '../../../interfaces/Notification';

interface ApproveContentProps {
  data: TransactionData;
}

const ApproveContent: FC<ApproveContentProps> = props => {
  const { data } = props;
  const { t } = useTranslation();
  const [locale] = useLocale();

  console.log(t, locale);

  return <div className="tc__wallet-popup__transaction-list__approve-content">{data.txnId}</div>;
};

export default memo(ApproveContent);
