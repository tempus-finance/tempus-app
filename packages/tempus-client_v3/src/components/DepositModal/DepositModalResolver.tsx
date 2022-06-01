import { FC, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chain, ProtocolName, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import {
  setPoolForYieldAtMaturity,
  setTempusPoolsForDepositModal,
  useConfig,
  useDepositModalData,
  useYieldAtMaturity,
} from '../../hooks';
import { Loading } from '../shared';
import DepositModal from './DepositModal';
import './DepositModalResolver.scss';

export const DepositModalResolver: FC = (): JSX.Element => {
  const useDepositModalProps = useDepositModalData();
  const depositModalProps = useDepositModalProps();
  const config = useConfig();

  const navigate = useNavigate();
  const { chain, ticker, protocol } = useParams();

  // Keep at least one subscriber of the stream insides the hook
  useYieldAtMaturity();

  useEffect(() => {
    const filteredPools = getConfigManager()
      .getFilteredPoolList(chain as Chain, ticker as Ticker, protocol as ProtocolName)
      .filter(pool => pool.maturityDate > Date.now());

    setTempusPoolsForDepositModal(filteredPools);
    setPoolForYieldAtMaturity(filteredPools[0]);
  }, [chain, ticker, protocol]);

  const chainConfig = useMemo(() => config?.[chain as Chain], [chain, config]);

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
      chainConfig={chainConfig}
    />
  ) : (
    <div className="tc__deposit-modal__loading">
      <Loading size={100} color="primary" />
    </div>
  );
};
