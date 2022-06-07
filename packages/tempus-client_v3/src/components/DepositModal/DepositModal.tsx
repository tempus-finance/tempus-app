import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, chainIdToChainName, Ticker, ZERO } from 'tempus-core-services';
import {
  setPoolForYieldAtMaturity,
  setTokenAmountForYieldAtMaturity,
  useDepositModalData,
  useTokenBalances,
} from '../../hooks';
import { MaturityTerm, TokenMetadata, TokenMetadataProp } from '../../interfaces';
import { ModalProps } from '../shared/Modal/Modal';
import { ActionButtonState, Loading } from '../shared';
import CurrencyInputModal, { CurrencyInputModalActionButtonLabels } from '../CurrencyInputModal';
import DepositModalChart from './DepositModalChart';
import DepositModalHeader from './DepositModalHeader';
import DepositModalInfoRows from './DepositModalInfoRows';

import './DepositModal.scss';

export interface DepositModalProps extends ModalProps {
  tokens?: TokenMetadataProp;
  poolStartDate?: Date;
  maturityTerms?: MaturityTerm[];
  chainConfig?: ChainConfig;
}

const DepositModal: FC<DepositModalProps> = props => {
  const { tokens, open, onClose, poolStartDate, maturityTerms, chainConfig } = props;
  const [maturityTerm, setMaturityTerm] = useState<MaturityTerm | undefined>();
  const [token, setToken] = useState<TokenMetadata | undefined>();
  const [approved, setApproved] = useState(false);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const balances = useTokenBalances();
  const { t } = useTranslation();

  const useDepositModalProps = useDepositModalData();
  const modalProps = useDepositModalProps();

  const actionButtonLabels: CurrencyInputModalActionButtonLabels = {
    preview: {
      default: t('DepositModal.labelMakeDeposit'),
      loading: '',
      success: '',
    },
    action: approved
      ? {
          default: t('DepositModal.labelExecuteDefault'),
          loading: t('DepositModal.labelExecuteLoading'),
          success: t('DepositModal.labelExecuteSuccess'),
        }
      : {
          default: t('DepositModal.labelApproveDefault'),
          loading: t('DepositModal.labelApproveLoading'),
          success: t('DepositModal.labelApproveSuccess'),
        },
  };

  useEffect(() => {
    if (maturityTerms) {
      setMaturityTerm(maturityTerms[0]);
    }
  }, [maturityTerms]);

  useEffect(() => {
    if (tokens) {
      setToken(tokens[0]);
    }
  }, [tokens]);

  const balance = useMemo(() => {
    const chain = chainConfig?.chainId ? chainIdToChainName(chainConfig?.chainId) : undefined;
    return balances[`${chain}-${token?.address}`] ?? ZERO;
  }, [balances, chainConfig, token]);

  const depositYieldChart = useMemo(
    () =>
      poolStartDate && maturityTerms && maturityTerm ? (
        <DepositModalChart
          poolStartDate={poolStartDate}
          maturityTerms={maturityTerms}
          selectedMaturityTerm={maturityTerm}
        />
      ) : (
        <div className="tc__deposit-modal__preview-loading-placeholder">
          <Loading size={60} color="primary" />
        </div>
      ),
    [maturityTerm, maturityTerms, poolStartDate],
  );

  const handleMaturityChange = useCallback(
    (newTerm: MaturityTerm) => {
      const termIndex = maturityTerms?.findIndex(term => term.date === newTerm.date) ?? 0;
      const selectedPool = modalProps?.tempusPools[termIndex];

      if (selectedPool) {
        setPoolForYieldAtMaturity(selectedPool);
      }

      setMaturityTerm(newTerm);
    },
    [maturityTerms, modalProps],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Ticker) => {
      const newToken = tokens?.find(value => value.ticker === newCurrency);

      if (newToken) {
        setToken(newToken);
      }
    },
    [tokens],
  );

  const approveDeposit = useCallback(() => {
    // TODO: Implement approve deposit function
    setActionButtonState('loading');

    setTimeout(() => {
      setActionButtonState('success');

      setTimeout(() => {
        setActionButtonState('default');
        setApproved(true);
      }, 3000);
    }, 5000);

    return '0x0';
  }, []);

  const deposit = useCallback(() => {
    // TODO: Implement deposit function
    setActionButtonState('loading');

    setTimeout(() => {
      setActionButtonState('success');
    }, 5000);

    return '0x0';
  }, []);

  return (
    <CurrencyInputModal
      tokens={tokens}
      open={open}
      onClose={onClose}
      title={t('DepositModal.title')}
      description={{
        preview: t('DepositModal.previewDescription'),
        action: t('DepositModal.description', {
          asset: tokens?.[0].ticker,
          term: maturityTerm?.date.toLocaleDateString(),
        }),
      }}
      preview={depositYieldChart}
      header={<DepositModalHeader />}
      maturityTerms={maturityTerms}
      balance={balance}
      infoRows={
        tokens && token ? (
          <DepositModalInfoRows balance={balance} balanceToken={token} yieldToken={tokens[1]} />
        ) : undefined
      }
      actionButtonLabels={actionButtonLabels}
      actionButtonState={actionButtonState}
      onTransactionStart={approved ? deposit : approveDeposit}
      onMaturityChange={handleMaturityChange}
      onAmountChange={setTokenAmountForYieldAtMaturity}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default DepositModal;
