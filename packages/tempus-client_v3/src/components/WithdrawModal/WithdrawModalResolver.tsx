import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { WithdrawModal } from './WithdrawModal';

export const WithdrawModalResolver: FC = () => {
  const { chain, ticker, protocol, poolAddress } = useParams();

  // Temp solution to mitigate ESlint unused param error
  console.log(chain, ticker, protocol, poolAddress);

  return (
    // TODO - Replace dummy data with data from hooks
    <WithdrawModal inputPrecision={4} usdRates={new Map()} onClose={() => {}} open />
  );
};
