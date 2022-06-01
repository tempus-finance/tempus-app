import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWalletBalances } from '../../hooks';
import { setTempusPoolForWithdrawModal, useWithdrawModalProps } from '../../hooks/useWithdrawModalProps';
import { WithdrawModal } from './WithdrawModal';

export const WithdrawModalResolver: FC = () => {
  const { chain, ticker, protocol, poolAddress } = useParams();

  const walletBalances = useWalletBalances();
  console.log(walletBalances);

  const withdrawModalProps = useWithdrawModalProps();

  useEffect(() => {
    if (poolAddress) {
      setTempusPoolForWithdrawModal(poolAddress);
    }
  }, [poolAddress]);

  // Temp solution to mitigate ESlint unused param error
  console.log(chain, ticker, protocol, poolAddress);

  return withdrawModalProps && <WithdrawModal tokens={withdrawModalProps} onClose={() => {}} open />;
};
