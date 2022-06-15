import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, chainIdToChainName, Ticker, ZERO } from 'tempus-core-services';
import { dateFormatter, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS } from '../../constants';
import {
  setPoolForYieldAtMaturity,
  setTokenAmountForYieldAtMaturity,
  useDepositModalData,
  useTokenBalances,
  useTokenApprove,
  useSigner,
  useUserPreferences,
  usePoolList,
  useFixedDeposit,
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
  tokens: TokenMetadataProp;
  poolStartDate?: Date;
  maturityTerms: MaturityTerm[];
  chainConfig: ChainConfig;
}

const DepositModal: FC<DepositModalProps> = props => {
  const { tokens, open, onClose, poolStartDate, maturityTerms, chainConfig } = props;

  const { t } = useTranslation();

  const useDepositModalProps = useDepositModalData();
  const modalProps = useDepositModalProps();

  const tempusPools = usePoolList();
  const balances = useTokenBalances();
  const [signer] = useSigner();
  const [{ slippage }] = useUserPreferences();
  const { fixedDeposit } = useFixedDeposit();
  const { approveToken, approveTokenStatus } = useTokenApprove();

  const [maturityTerm, setMaturityTerm] = useState<MaturityTerm>(maturityTerms[0]);
  const [token, setToken] = useState<TokenMetadata>(tokens[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');

  const actionButtonLabels: CurrencyInputModalActionButtonLabels = {
    preview: {
      default: t('DepositModal.labelMakeDeposit'),
      loading: '',
      success: '',
    },
    action: approveTokenStatus?.success
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
    if (approveTokenStatus) {
      if (approveTokenStatus.pending) {
        setActionButtonState('loading');
      }

      if (approveTokenStatus.success) {
        setActionButtonState('success');

        setTimeout(() => {
          setActionButtonState('default');
        }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
      }
    } else {
      setActionButtonState('default');
    }
  }, [approveTokenStatus]);

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
      const termIndex = maturityTerms.findIndex(term => term.date === newTerm.date) ?? 0;
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
      const newToken = tokens.find(value => value.ticker === newCurrency);
      if (newToken) {
        setToken(newToken);
      }
    },
    [tokens],
  );

  /**
   * TODO - Check token allowance before executing another approval - to save gas cost
   */
  const handleApprove = useCallback(
    async (amount: Decimal) => {
      const tempusPool = tempusPools.find(pool => pool.maturityDate === maturityTerm.date.getTime());

      // Approve selected token entered amount
      if (tempusPool && signer) {
        setActionButtonState('loading');

        approveToken({
          chain: tempusPool.chain,
          tokenAddress: token.address,
          spenderAddress: chainConfig.tempusControllerContract,
          amount,
          signer,
        });
      }

      return approveTokenStatus?.contractTransaction?.hash || '0x0';
    },
    [
      tempusPools,
      signer,
      approveTokenStatus?.contractTransaction?.hash,
      maturityTerm.date,
      approveToken,
      token.address,
      chainConfig.tempusControllerContract,
    ],
  );

  const handleDeposit = useCallback(
    async (amount: Decimal) => {
      const tempusPool = tempusPools.find(pool => pool.maturityDate === maturityTerm.date.getTime());

      if (signer && tempusPool) {
        setActionButtonState('loading');

        fixedDeposit({
          chain: tempusPool.chain,
          poolAddress: tempusPool.address,
          tokenAmount: amount,
          tokenTicker: token.ticker,
          tokenAddress: token.address,
          slippage,
          signer,
        });
      }

      return approveTokenStatus?.contractTransaction?.hash || '0x0';
    },
    [
      tempusPools,
      signer,
      approveTokenStatus?.contractTransaction?.hash,
      maturityTerm.date,
      fixedDeposit,
      token.ticker,
      token.address,
      slippage,
    ],
  );

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
          term: dateFormatter.format(maturityTerm?.date),
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
      onTransactionStart={approveTokenStatus?.success ? handleDeposit : handleApprove}
      onMaturityChange={handleMaturityChange}
      onAmountChange={setTokenAmountForYieldAtMaturity}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default DepositModal;
