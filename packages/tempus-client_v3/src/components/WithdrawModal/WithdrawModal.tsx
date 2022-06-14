import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, chainIdToChainName, Decimal, DecimalUtils, TempusPool, Ticker } from 'tempus-core-services';
import { TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS } from '../../constants';
import { useLocale, useSigner, useTokenApprove, useTokenBalance, useUserPreferences } from '../../hooks';
import { useWithdraw } from '../../hooks/useWithdraw';
import { TokenMetadataProp } from '../../interfaces';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import SuccessModal from '../SuccessModal/SuccessModal';

export interface WithdrawModalProps extends ModalProps {
  tokens: TokenMetadataProp;
  chainConfig: ChainConfig;
  tempusPool: TempusPool;
}

export const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { open, onClose, tokens, chainConfig, tempusPool } = props;

  const { t } = useTranslation();

  const [locale] = useLocale();
  const [signer] = useSigner();
  const { approveToken, approveTokenStatus } = useTokenApprove();
  const { withdraw, withdrawStatus } = useWithdraw();
  const capitalsBalanceData = useTokenBalance(tempusPool.principalsAddress, tempusPool.chain);
  const yieldsBalanceData = useTokenBalance(tempusPool.yieldsAddress, tempusPool.chain);
  const lpBalanceData = useTokenBalance(tempusPool.ammAddress, tempusPool.chain);
  const [{ slippage }] = useUserPreferences();

  const [balance, setBalance] = useState(tokens[0].balance);
  const [currency, setCurrency] = useState(tokens[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const [approvedTokens, setApprovedTokens] = useState<string[]>([]);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [withdrawSuccessful, setWithdrawSuccessful] = useState<boolean>(false);

  /**
   * For withdrawal we need to approve three tokens (TPS, TYS, LP), and useApproveToken supports only one token, so we
   * need to call useApproveToken three times, this useEffect keeps track of all approved tokens.
   */
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
    if (withdrawStatus?.success) {
      setActionButtonState('success');

      setTimeout(() => {
        setWithdrawSuccessful(true);
      }, TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS);
    }
  }, [withdrawStatus]);

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
      if (lpBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.ammAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: lpBalanceData.balance,
          signer,
        });
      } else {
        // No token balance - set tokens as approved automatically
        setApprovedTokens(currentState => [...currentState, tempusPool.ammAddress]);
      }
      if (capitalsBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.principalsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: capitalsBalanceData.balance,
          signer,
        });
      } else {
        // No token balance - set tokens as approved automatically
        setApprovedTokens(currentState => [...currentState, tempusPool.principalsAddress]);
      }
      if (yieldsBalanceData?.balance?.gt(0)) {
        approveToken({
          chain: tempusPool.chain,
          tokenAddress: tempusPool.yieldsAddress,
          spenderAddress: chainConfig.tempusControllerContract,
          amount: yieldsBalanceData.balance,
          signer,
        });
      } else {
        // No token balance - set tokens as approved automatically
        setApprovedTokens(currentState => [...currentState, tempusPool.yieldsAddress]);
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
    lpBalanceData?.balance,
    approveTokenStatus?.contractTransaction?.hash,
  ]);

  const handleWithdraw = useCallback(
    async (amount: Decimal) => {
      setActionButtonState('loading');

      const chain = chainConfig.chainId ? chainIdToChainName(chainConfig.chainId) : undefined;

      if (signer && chain && capitalsBalanceData?.balance && yieldsBalanceData?.balance && lpBalanceData?.balance) {
        withdraw({
          amount,
          chain,
          poolAddress: tempusPool.address,
          token: currency.ticker,
          tokenBalance: currency.balance,
          capitalsBalance: capitalsBalanceData.balance,
          yieldsBalance: yieldsBalanceData.balance,
          lpBalance: lpBalanceData.balance,
          slippage,
          signer,
        });
      }

      return approveTokenStatus?.contractTransaction?.hash || '0x0';
    },
    [
      signer,
      slippage,
      chainConfig.chainId,
      tempusPool.address,
      capitalsBalanceData?.balance,
      yieldsBalanceData?.balance,
      lpBalanceData?.balance,
      currency.ticker,
      currency.balance,
      approveTokenStatus?.contractTransaction?.hash,
      withdraw,
    ],
  );

  return (
    <>
      {/* Show withdraw modal if withdraw is not yet finalized */}
      {!withdrawSuccessful && (
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
      )}
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
        onClose={() => {}}
        onPrimaryButtonClick={() => {}}
        onSecondaryButtonClick={() => {}}
        open={withdrawSuccessful}
        title="Withdraw Complete!"
      />
    </>
  );
};
