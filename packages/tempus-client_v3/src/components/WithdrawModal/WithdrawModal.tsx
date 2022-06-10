import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, chainIdToChainName, Decimal, DecimalUtils, TempusPool, Ticker } from 'tempus-core-services';
import { TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS } from '../../constants';
import { useSigner, useTokenApprove, useTokenBalance, useUserPreferences } from '../../hooks';
import { useWithdraw } from '../../hooks/useWithdraw';
import { TokenMetadataProp } from '../../interfaces';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';

export interface WithdrawModalProps extends ModalProps {
  tokens: TokenMetadataProp;
  chainConfig: ChainConfig;
  tempusPool: TempusPool;
}

export const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { open, onClose, tokens, chainConfig, tempusPool } = props;

  const { t } = useTranslation();

  const [signer] = useSigner();
  const { approveToken, approveTokenStatus } = useTokenApprove();
  const { withdraw } = useWithdraw();
  const capitalsBalanceData = useTokenBalance(tempusPool.principalsAddress, tempusPool.chain);
  const yieldsBalanceData = useTokenBalance(tempusPool.yieldsAddress, tempusPool.chain);
  const lpTokenBalanceData = useTokenBalance(tempusPool.ammAddress, tempusPool.chain);
  const [{ slippage }] = useUserPreferences();

  const [balance, setBalance] = useState(tokens[0].balance);
  const [currency, setCurrency] = useState(tokens[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const [approvedTokens, setApprovedTokens] = useState<string[]>([]);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);

  useEffect(() => {
    if (approveTokenStatus) {
      setApprovedTokens(currentState => {
        if (approveTokenStatus.request) {
          return [...currentState, approveTokenStatus.request.tokenAddress];
        }
        return currentState;
      });
    }
  }, [approveTokenStatus]);

  useEffect(() => {
    const capitalsApproved = approvedTokens.findIndex(approvedToken => approvedToken === tempusPool.principalsAddress);
    const yieldsApproved = approvedTokens.findIndex(approvedToken => approvedToken === tempusPool.yieldsAddress);
    const lpApproved = approvedTokens.findIndex(approvedToken => approvedToken === tempusPool.ammAddress);

    if (capitalsApproved > -1 && yieldsApproved > -1 && lpApproved > -1) {
      setTokensApproved(true);
      setActionButtonState('success');

      setTimeout(() => {
        setActionButtonState('default');
      }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    }
  }, [approvedTokens, tempusPool.ammAddress, tempusPool.principalsAddress, tempusPool.yieldsAddress]);

  const formattedBalanceUsdValue = useMemo(() => {
    const usdValue = balance.mul(currency.rate);
    return DecimalUtils.formatToCurrency(usdValue, undefined, '$');
  }, [balance, currency.rate]);

  const infoRows = useMemo(
    () => (
      <CurrencyInputModalInfoRow
        label={t('WithdrawModal.labelAvailableForWithdraw')}
        value={balance.toString()}
        currency={currency.ticker}
        usdValue={formattedBalanceUsdValue}
      />
    ),
    [balance, currency.ticker, formattedBalanceUsdValue, t],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Ticker) => {
      const tokenMetadata = tokens.find(token => token.ticker === newCurrency);
      if (tokenMetadata) {
        setBalance(tokenMetadata.balance);
      }

      const newToken = tokens?.find(value => value.ticker === newCurrency);
      if (newToken) {
        setCurrency(newToken);
      }
    },
    [tokens],
  );

  /**
   * TODO - Check token allowance before executing another approval - to save gas cost
   */
  const handleApproveToken = useCallback(async () => {
    setActionButtonState('loading');

    // Approve all share tokens that have balance
    if (signer) {
      if (lpTokenBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.ammAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: lpTokenBalanceData.balance,
          signer,
        });
      }
      if (capitalsBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.principalsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: capitalsBalanceData.balance,
          signer,
        });
      }
      if (yieldsBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.yieldsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: yieldsBalanceData.balance,
          signer,
        });
      }
    }

    return approveTokenStatus?.contractTransaction?.hash || '0x0';
  }, [
    approveToken,
    signer,
    chainConfig.tempusControllerContract,
    tempusPool.chain,
    tempusPool.principalsAddress,
    tempusPool.yieldsAddress,
    tempusPool.ammAddress,
    capitalsBalanceData?.balance,
    yieldsBalanceData?.balance,
    lpTokenBalanceData?.balance,
    approveTokenStatus?.contractTransaction?.hash,
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
          slippage,
          signer,
        });
      }

      return approveTokenStatus?.contractTransaction?.hash || '0x0';
    },
    [
      approveTokenStatus?.contractTransaction?.hash,
      chainConfig.chainId,
      currency.ticker,
      slippage,
      tempusPool.address,
      signer,
      withdraw,
    ],
  );

  return (
    <CurrencyInputModal
      tokens={tokens}
      open={open}
      onClose={onClose}
      title={t('WithdrawModal.title')}
      description={t('WithdrawModal.description')}
      balance={balance}
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
  );
};
