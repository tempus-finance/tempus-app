import { FC, useEffect, useState } from 'react';
import { startOfDay, subDays } from 'date-fns';
import PoolDataAdapter, { UserTransaction } from '../../../../adapters/PoolDataAdapter';
import { TempusPool } from '../../../../interfaces/TempusPool';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import SectionContainer from '../sectionContainer';
import DetailUserInfoTransactionRow from './detailUserInfoTransactionRow';

interface DetailUserInfoTransactionsProps {
  poolDataAdapter: PoolDataAdapter | null;
  userWalletAddress: string;
  tempusPool: TempusPool;
}

const timeFramesToShow = [
  {
    label: 'Today',
    from: startOfDay(Date.now()),
    to: new Date(),
  },
  {
    label: 'Yesterday',
    from: startOfDay(subDays(Date.now(), 1)),
    to: startOfDay(Date.now()),
  },
  {
    label: 'Last week',
    from: startOfDay(subDays(Date.now(), 7)),
    to: startOfDay(subDays(Date.now(), 1)),
  },
  {
    label: 'Last month',
    from: startOfDay(subDays(Date.now(), 30)),
    to: startOfDay(subDays(Date.now(), 7)),
  },
];

const DetailUserInfoTransactions: FC<DetailUserInfoTransactionsProps> = props => {
  const { poolDataAdapter, userWalletAddress, tempusPool } = props;

  const [transactions, setTransactions] = useState<UserTransaction[]>([]);

  useEffect(() => {
    const fetchUserTransactionEvents = async () => {
      if (!poolDataAdapter) {
        return;
      }

      setTransactions(
        await poolDataAdapter.getUserTransactionEvents(tempusPool.address, userWalletAddress, tempusPool.backingToken),
      );
    };
    fetchUserTransactionEvents();
  }, [poolDataAdapter, userWalletAddress, tempusPool]);

  return (
    <SectionContainer>
      {timeFramesToShow.map(timeFrame => {
        const timeFrameTransactions = transactions.filter(transaction => {
          const eventDate = new Date(transaction.block.timestamp * 1000);

          if (eventDate > timeFrame.from && eventDate <= timeFrame.to) {
            return true;
          } else {
            return false;
          }
        });

        if (timeFrameTransactions.length === 0) {
          return null;
        }

        return (
          <>
            {/* Render time frame section label */}
            <Typography variant="h3" color="accent">
              {timeFrame.label}
            </Typography>
            <Spacer size={3} />

            {/* Render all events for specific time section */}
            {timeFrameTransactions
              .sort((a, b) => b.block.timestamp - a.block.timestamp)
              .map(transaction => {
                return <DetailUserInfoTransactionRow transaction={transaction} />;
              })}
          </>
        );
      })}
    </SectionContainer>
  );
};
export default DetailUserInfoTransactions;
