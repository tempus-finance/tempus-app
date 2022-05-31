import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chain, ProtocolName, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { useDepositModalData, setTempusPoolsForDepositModal } from '../../hooks';
import { Loading } from '../shared';
import DepositModal from './DepositModal';
import './DepositModalResolver.scss';

export const DepositModalResolver: FC = (): JSX.Element => {
  const useDepositModalProps = useDepositModalData();
  const depositModalProps = useDepositModalProps();

  const navigate = useNavigate();
  const { chain, ticker, protocol } = useParams();

  useEffect(() => {
    const filteredPools = getConfigManager().getFilteredPoolList(
      chain as Chain,
      ticker as Ticker,
      protocol as ProtocolName,
    );

    setTempusPoolsForDepositModal(filteredPools);
  }, [chain, ticker, protocol]);

  const handleCloseModal = () => {
    navigate(-1);
  };

  return depositModalProps ? (
    <DepositModal
      open
      onClose={handleCloseModal}
      poolStartDate={depositModalProps.poolStartDate}
      maturityTerms={depositModalProps.maturityTerms}
      tokens={depositModalProps.tokens}
    />
  ) : (
    <div className="tc__deposit-modal__loading">
      <Loading size={100} color="primary" />
    </div>
  );
};
