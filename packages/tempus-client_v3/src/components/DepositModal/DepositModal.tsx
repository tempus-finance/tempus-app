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
  useFixedDeposit,
  useAllowances,
} from '../../hooks';
import { MaturityTerm, TokenMetadata, TokenMetadataProp } from '../../interfaces';
import { ActionButtonState, Loading, ModalProps } from '../shared';
import CurrencyInputModal, { CurrencyInputModalActionButtonLabels } from '../CurrencyInputModal';
import SuccessModal from '../SuccessModal';
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
  const { tokens, onClose, poolStartDate, maturityTerms, chainConfig } = props;

  const { t } = useTranslation();

  const useDepositModalProps = useDepositModalData();
  const modalProps = useDepositModalProps();

  const balances = useTokenBalances();
  const [signer] = useSigner();
  const [{ slippage }] = useUserPreferences();
  const { fixedDeposit, fixedDepositStatus } = useFixedDeposit();
  const { approveToken, approveTokenStatus } = useTokenApprove();
  const tokenAllowances = useAllowances();

  const [maturityTerm, setMaturityTerm] = useState<MaturityTerm>(maturityTerms[0]);
  const [token, setToken] = useState<TokenMetadata>(tokens[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const [fixedDepositSuccessful, setFixedDepositSuccessful] = useState<boolean>(false);
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);

  const approveTokenTxnHash = approveTokenStatus?.contractTransaction?.hash ?? '0x0';
  const depositTokenTxnHash = fixedDepositStatus?.contractTransaction?.hash ?? '0x0';
  const { chainId } = chainConfig ?? {};

  const actionButtonLabels: CurrencyInputModalActionButtonLabels = {
    preview: {
      default: t('DepositModal.labelMakeDeposit'),
      loading: '',
      success: '',
    },
    action: tokenApproved
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
        setTokenApproved(true);

        setTimeout(() => {
          setActionButtonState('default');
        }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
      }
    } else {
      setActionButtonState('default');
    }
  }, [approveTokenStatus]);

  useEffect(() => {
    if (fixedDepositStatus?.success) {
      setActionButtonState('success');

      setTimeout(() => {
        setFixedDepositSuccessful(true);
      }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    }
  }, [fixedDepositStatus?.success]);

  const filteredTempusPools = useMemo(() => modalProps?.tempusPools ?? [], [modalProps]);
  const chain = useMemo(
    () => (chainId ? chainIdToChainName(chainId) : filteredTempusPools[0]?.chain),
    [chainId, filteredTempusPools],
  );
  const balance = useMemo(() => balances[`${chain}-${token?.address}`] ?? ZERO, [balances, chain, token]);

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

  const handleApprove = useCallback(
    async (amount: Decimal) => {
      const tempusPool = filteredTempusPools.find(pool => pool.maturityDate === maturityTerm.date.getTime());

      // Approve selected token entered amount
      if (tempusPool && signer) {
        const tokenAllowance = tokenAllowances[`${tempusPool.chain}-${token.address}`];

        if (!tokenAllowance?.alwaysApproved && amount.gt(tokenAllowance?.amount ?? ZERO)) {
          setActionButtonState('loading');

          approveToken({
            chain: tempusPool.chain,
            tokenAddress: token.address,
            spenderAddress: chainConfig.tempusControllerContract,
            amount,
            signer,
          });
        } else {
          setTokenApproved(true);
        }
      }

      return approveTokenTxnHash;
    },
    [
      filteredTempusPools,
      signer,
      tokenAllowances,
      approveTokenTxnHash,
      maturityTerm.date,
      approveToken,
      token.address,
      chainConfig.tempusControllerContract,
    ],
  );

  const handleDeposit = useCallback(
    async (amount: Decimal) => {
      const tempusPool = filteredTempusPools.find(pool => pool.maturityDate === maturityTerm.date.getTime());

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

      return depositTokenTxnHash;
    },
    [
      filteredTempusPools,
      signer,
      depositTokenTxnHash,
      maturityTerm.date,
      fixedDeposit,
      token.ticker,
      token.address,
      slippage,
    ],
  );

  const handleAmountChange = useCallback(
    (amount: Decimal) => {
      setTokenAmountForYieldAtMaturity(amount);

      const tempusPool = filteredTempusPools.find(pool => pool.maturityDate === maturityTerm.date.getTime());
      if (tempusPool) {
        const tokenAllowance = tokenAllowances[`${tempusPool.chain}-${token.address}`];

        if (Boolean(tokenAllowance?.alwaysApproved) || amount.lte(tokenAllowance?.amount ?? ZERO)) {
          setTokenApproved(true);
        }
      }
    },
    [tokenAllowances, filteredTempusPools, maturityTerm.date, token.address],
  );

  return (
    <>
      <CurrencyInputModal
        tokens={tokens}
        open={!fixedDepositSuccessful}
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
        onTransactionStart={tokenApproved ? handleDeposit : handleApprove}
        onMaturityChange={handleMaturityChange}
        onAmountChange={handleAmountChange}
        onCurrencyUpdate={handleCurrencyChange}
        chainConfig={chainConfig}
      />
      {/* Show success modal if withdraw is finalized */}
      <SuccessModal
        description={t('DepositModal.successModalDescription', {
          amount: 'AMOUNT', // TODO - Parse amount from tx receipt and put it here
          ticker: token.ticker,
          term: dateFormatter.format(maturityTerm.date),
        })}
        primaryButtonLabel={{
          default: t('DepositModal.successModalPrimaryButton'),
        }}
        secondaryButtonLabel={{
          default: t('DepositModal.successModalSecondaryButton'),
        }}
        onClose={() => {}}
        onPrimaryButtonClick={() => {}}
        onSecondaryButtonClick={() => {}}
        open={fixedDepositSuccessful}
        title={t('DepositModal.successModalTitle')}
      />
    </>
  );
};

export default DepositModal;
