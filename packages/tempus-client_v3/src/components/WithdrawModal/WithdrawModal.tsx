import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChainConfig, chainIdToChainName, Decimal, DecimalUtils, TempusPool, Ticker, ZERO } from 'tempus-core-services';
import { v4 as uuidv4 } from 'uuid';
import { TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS } from '../../constants';
import {
  useAllowances,
  useAppEvent,
  useLocale,
  useSigner,
  useTokenApprove,
  useTokenBalance,
  useUserPreferences,
} from '../../hooks';
import { useWithdraw } from '../../hooks/useWithdraw';
import { TokenMetadataProp } from '../../interfaces';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import ErrorModal from '../ErrorModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import SuccessModal from '../SuccessModal/SuccessModal';

export interface WithdrawModalProps extends ModalProps {
  tokens: TokenMetadataProp;
  chainConfig: ChainConfig;
  tempusPool: TempusPool;
}

export const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { onClose, tokens, chainConfig, tempusPool } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [locale] = useLocale();
  const [signer] = useSigner();
  const { approveToken, approveTokenStatus } = useTokenApprove();
  const { withdraw, withdrawStatus } = useWithdraw();
  const capitalsBalanceData = useTokenBalance(tempusPool.principalsAddress, tempusPool.chain);
  const yieldsBalanceData = useTokenBalance(tempusPool.yieldsAddress, tempusPool.chain);
  const lpBalanceData = useTokenBalance(tempusPool.ammAddress, tempusPool.chain);
  const [{ slippage }] = useUserPreferences();
  const tokenAllowances = useAllowances();
  const [, emitAppEvent] = useAppEvent();

  const [currency, setCurrency] = useState(tokens[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [withdrawSuccessful, setWithdrawSuccessful] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<Error>();
  const [approveTxnIds, setApproveTxnIds] = useState<string[]>([]);

  const capitalsTokenBalance = capitalsBalanceData?.balance ?? ZERO;
  const yieldsTokenBalance = yieldsBalanceData?.balance ?? ZERO;
  const lpTokenBalance = lpBalanceData?.balance ?? ZERO;
  const approveTokenTxnHash = approveTokenStatus?.contractTransaction?.hash ?? '0x0';
  const withdrawTokenTxnHash = withdrawStatus?.contractTransaction?.hash ?? '0x0';

  useEffect(() => {
    if (approveTokenStatus && approveTxnIds.includes(approveTokenStatus.txnId) && approveTokenStatus.error) {
      setActionButtonState('default');
      setWithdrawError(approveTokenStatus.error);
    } else {
      setActionButtonState('default');
    }
  }, [approveTokenStatus, approveTxnIds]);

  useEffect(() => {
    if (withdrawStatus?.success) {
      setActionButtonState('success');
      emitAppEvent({
        eventType: 'withdraw',
        tempusPool,
        txnHash: withdrawStatus.contractTransaction?.hash ?? '0x0',
        timestamp: withdrawStatus.contractTransaction?.timestamp ?? Date.now(),
      });

      setTimeout(() => {
        setWithdrawSuccessful(true);
      }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    }
  }, [withdrawStatus, emitAppEvent, tempusPool]);

  useEffect(() => {
    const capitalsAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.principalsAddress}`];
    const yieldsAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.yieldsAddress}`];
    const lpAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.ammAddress}`];

    const capitalsApproved = capitalsAllowance?.alwaysApproved || capitalsAllowance?.amount.gte(capitalsTokenBalance);
    const yieldsApproved = yieldsAllowance?.alwaysApproved || yieldsAllowance?.amount.gte(yieldsTokenBalance);
    const lpApproved = lpAllowance?.alwaysApproved || lpAllowance?.amount.gte(lpTokenBalance);

    if (capitalsApproved && yieldsApproved && lpApproved) {
      setTokensApproved(true);
      setActionButtonState('success');

      setTimeout(() => {
        setActionButtonState('default');
      }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    }
  }, [
    tokenAllowances,
    tempusPool.chain,
    tempusPool.ammAddress,
    tempusPool.principalsAddress,
    tempusPool.yieldsAddress,
    capitalsTokenBalance,
    yieldsTokenBalance,
    lpTokenBalance,
  ]);

  const formattedBalanceUsdValue = useMemo(() => {
    const usdValue = currency.balance.mul(currency.rate);
    return DecimalUtils.formatToCurrency(usdValue, undefined, '$');
  }, [currency.rate, currency.balance]);

  const infoRows = useMemo(
    () => (
      <CurrencyInputModalInfoRow
        label={t('WithdrawModal.labelAvailableForWithdraw')}
        value={currency.balance.toString()}
        currency={currency.ticker}
        usdValue={formattedBalanceUsdValue}
      />
    ),
    [currency.balance, currency.ticker, formattedBalanceUsdValue, t],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Ticker) => {
      const tokenMetadata = tokens.find(token => token.ticker === newCurrency);
      if (tokenMetadata) {
        setCurrency(tokenMetadata);
      }
    },
    [tokens],
  );

  const handleApproveToken = useCallback(async () => {
    setActionButtonState('loading');

    // Approve all share tokens that have balance
    if (signer) {
      const capitalsAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.principalsAddress}`];
      const yieldsAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.yieldsAddress}`];
      const lpAllowance = tokenAllowances[`${tempusPool.chain}-${tempusPool.ammAddress}`];

      const lpApproveTxnId = uuidv4();
      const capitalsApproveTxnId = uuidv4();
      const yieldsApproveTxnId = uuidv4();

      if (!lpAllowance?.alwaysApproved && lpTokenBalance.gt(lpAllowance?.amount ?? ZERO)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.ammAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: lpTokenBalance,
          signer,
          txnId: lpApproveTxnId,
        });
      }

      if (!capitalsAllowance?.alwaysApproved && capitalsTokenBalance.gt(capitalsAllowance?.amount ?? ZERO)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.principalsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: capitalsTokenBalance,
          signer,
          txnId: capitalsApproveTxnId,
        });
      }

      if (!yieldsAllowance?.alwaysApproved && yieldsTokenBalance.gt(yieldsAllowance?.amount ?? ZERO)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.yieldsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: yieldsTokenBalance,
          signer,
          txnId: yieldsApproveTxnId,
        });
      }

      setApproveTxnIds([lpApproveTxnId, capitalsApproveTxnId, yieldsApproveTxnId]);
    }

    return approveTokenTxnHash;
  }, [
    tokenAllowances,
    approveToken,
    signer,
    chainConfig.tempusControllerContract,
    tempusPool.chain,
    tempusPool.principalsAddress,
    tempusPool.yieldsAddress,
    tempusPool.ammAddress,
    capitalsTokenBalance,
    yieldsTokenBalance,
    lpTokenBalance,
    approveTokenTxnHash,
  ]);

  const handleWithdraw = useCallback(
    async (amount: Decimal) => {
      setActionButtonState('loading');

      const chain = chainConfig.chainId ? chainIdToChainName(chainConfig.chainId) : undefined;

      if (signer && chain) {
        withdraw({
          amount,
          chain,
          poolAddress: tempusPool.address,
          token: currency.ticker,
          tokenBalance: currency.balance,
          capitalsBalance: capitalsTokenBalance,
          yieldsBalance: yieldsTokenBalance,
          lpBalance: lpTokenBalance,
          slippage,
          signer,
        });
      }

      return withdrawTokenTxnHash;
    },
    [
      signer,
      slippage,
      chainConfig.chainId,
      tempusPool.address,
      capitalsTokenBalance,
      yieldsTokenBalance,
      lpTokenBalance,
      currency.ticker,
      currency.balance,
      withdrawTokenTxnHash,
      withdraw,
    ],
  );

  const handleDepositInAnotherPoolClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleManagePortfolioClick = useCallback(() => {
    navigate('/portfolio/overview');
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    // TODO - If user withdraws from Portfolio page we should navigate back to Portfolio page
    navigate('/portfolio/positions');
  }, [navigate]);

  const handleErrorTryAgain = useCallback(() => {
    setWithdrawError(undefined);
  }, []);

  return (
    <>
      {/* Show withdraw modal if withdraw is not yet finalized */}
      <CurrencyInputModal
        tokens={tokens}
        open={!withdrawSuccessful && !withdrawError}
        onClose={onClose}
        title={t('WithdrawModal.title')}
        description={t('WithdrawModal.description')}
        balance={currency.balance}
        infoRows={infoRows}
        actionButtonLabels={{
          action: {
            default: t('WithdrawModal.labelExecuteDefault'),
            loading: t('WithdrawModal.labelExecuteLoading'),
            success: t('WithdrawModal.labelExecuteSuccess'),
          },
        }}
        actionButtonState={actionButtonState}
        onTransactionStart={tokensApproved ? handleWithdraw : handleApproveToken}
        onCurrencyUpdate={handleCurrencyChange}
        chainConfig={chainConfig}
      />
      {/* Show success modal if withdraw is finalized */}
      <SuccessModal
        description={`You have withdrawn [AMOUNT] ${currency.ticker} with ${new Date(
          tempusPool.maturityDate,
        ).toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} term. It should reach your wallet momentarily.`}
        primaryButtonLabel={{
          default: 'Manage Portfolio',
        }}
        secondaryButtonLabel={{
          default: 'Deposit in another pool',
        }}
        onClose={handleCloseModal}
        onPrimaryButtonClick={handleManagePortfolioClick}
        onSecondaryButtonClick={handleDepositInAnotherPoolClick}
        open={withdrawSuccessful}
        title="Withdraw Complete!"
      />
      {/* Show error modal if withdraw throws Error */}
      <ErrorModal
        description={t('WithdrawModal.errorModalDescription')}
        primaryButtonLabel={{
          default: t('WithdrawModal.errorModalPrimaryButton'),
        }}
        onClose={handleCloseModal}
        onPrimaryButtonClick={handleErrorTryAgain}
        open={Boolean(withdrawError)}
        title={t('WithdrawModal.errorModalTitle')}
      />
    </>
  );
};
