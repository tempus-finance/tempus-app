import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Decimal } from 'tempus-core-services';
import { PoolPositionModal } from './PoolPositionModal';

export const PoolPositionModalResolver: FC = () => {
  const { chain, ticker, protocol, poolAddress } = useParams();

  // Temp solution to mitigate ESlint unused param error
  console.log(chain, ticker, protocol, poolAddress);

  return (
    // TODO - Replace dummy data with data from hooks
    <PoolPositionModal
      apr={0.1}
      balance={new Decimal(20)}
      chartData={[
        { x: new Date(2022, 3, 4), y: 10 },
        { x: new Date(2022, 4, 1), y: 20 },
      ]}
      onWithdraw={() => {}}
      profitLoss={new Decimal(2)}
      projectedTotalYield={new Decimal(3)}
      term={new Date(2022, 4, 2)}
      tokenDecimals={4}
      tokenExchangeRate={new Decimal(100)}
      totalYieldEarned={new Decimal(2)}
      tokenTicker="ETH"
    />
  );
};
