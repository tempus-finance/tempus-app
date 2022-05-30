import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Decimal } from 'tempus-core-services';
import { WithdrawModal } from './WithdrawModal';

export const WithdrawModalResolver: FC = () => {
  const { chain, ticker, protocol, poolAddress } = useParams();

  // Temp solution to mitigate ESlint unused param error
  console.log(chain, ticker, protocol, poolAddress);

  return (
    // TODO - Replace dummy data with data from hooks
    <WithdrawModal
      tokens={[
        {
          precision: 18,
          rate: new Decimal(2000),
          ticker: 'ETH',
        },
        {
          precision: 18,
          rate: new Decimal(2000),
          ticker: 'stETH',
        },
      ]}
      onClose={() => {}}
      open
    />
  );
};
