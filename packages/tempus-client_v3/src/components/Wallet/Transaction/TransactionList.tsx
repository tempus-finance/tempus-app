import { FC, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolMap } from '../../../hooks';
import { Notification } from '../../../interfaces/Notification';
import { ButtonWrapper, Icon, Typography } from '../../shared';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Notification[];
}

const DEFAULT_DISPLAY_ITEMS = 3;
const MAX_DISPLAY_ITEMS = 10;

const TransactionList: FC<TransactionListProps> = props => {
  const { transactions } = props;
  const { t } = useTranslation();
  const poolMap = usePoolMap();

  const [showMore, setShowMore] = useState<boolean>(false);
  const handleShowMore = useCallback(() => setShowMore(true), []);
  const handleShowLess = useCallback(() => setShowMore(false), []);
  const displayItems = useMemo(
    () => transactions.slice(0, showMore ? MAX_DISPLAY_ITEMS : DEFAULT_DISPLAY_ITEMS),
    [showMore, transactions],
  );

  return (
    <div className="tc__wallet-popup__transaction-list">
      {displayItems.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          tempusPool={poolMap[`${transaction.chain}-${transaction.data?.poolAddress}`]}
        />
      ))}
      {!transactions.length && (
        <Typography variant="body-secondary">{t('TransactionList.descriptionNoTransactions')}</Typography>
      )}
      {transactions.length >= DEFAULT_DISPLAY_ITEMS && !showMore && (
        <div className="tc__wallet-popup__transaction-list__show-more">
          <ButtonWrapper onClick={handleShowMore}>
            <Typography variant="body-secondary" weight="bold">
              {t('TransactionList.buttonShowMore')}
            </Typography>
            <Icon variant="down-chevron" size="tiny" />
          </ButtonWrapper>
        </div>
      )}
      {transactions.length >= DEFAULT_DISPLAY_ITEMS && showMore && (
        <div className="tc__wallet-popup__transaction-list__show-more">
          <ButtonWrapper onClick={handleShowLess}>
            <Typography variant="body-secondary" weight="bold">
              {t('TransactionList.buttonShowLess')}
            </Typography>
            <Icon variant="up-chevron" size="tiny" />
          </ButtonWrapper>
        </div>
      )}
    </div>
  );
};

export default memo(TransactionList);
