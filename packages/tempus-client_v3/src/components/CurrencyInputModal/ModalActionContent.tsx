import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, TempusPool, Ticker } from 'tempus-core-services';
import { setPoolForFees, useFees } from '../../hooks';
import { TokenMetadataProp } from '../../interfaces';
import FeeTooltip from '../FeeTooltip';
import {
  ActionButton,
  ActionButtonLabels,
  ActionButtonState,
  CurrencyInput,
  Icon,
  Link,
  ProgressBar,
  Typography,
} from '../shared';

interface ModalActionContentProps {
  selectedPool?: TempusPool;
  balance: Decimal;
  tokens: TokenMetadataProp;
  disabledInput: boolean;
  chainConfig?: ChainConfig;
  infoRows?: ReactNode;
  actionButtonLabels: ActionButtonLabels;
  actionButtonState: ActionButtonState;
  onAmountChange?: (amount: Decimal) => void;
  onTransactionStart: (amount: Decimal) => Promise<string>;
  onCurrencyUpdate?: (currency: Ticker) => void;
}

const ModalActionContent: FC<ModalActionContentProps> = props => {
  const {
    selectedPool,
    balance,
    tokens,
    disabledInput,
    chainConfig,
    infoRows,
    actionButtonLabels,
    actionButtonState,
    onAmountChange,
    onTransactionStart,
    onCurrencyUpdate,
  } = props;
  const { t } = useTranslation();
  const fees = useFees();

  const [amount, setAmount] = useState('');
  const [transactionProgress, setTransactionProgress] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPool) {
      setPoolForFees(selectedPool);
    }
  }, [selectedPool]);

  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);

  const insufficientBalance = amountDecimal.gt(balance);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      onAmountChange?.(Decimal.parse(value, 0));
    },
    [onAmountChange],
  );

  const handleActionButtonClick = useCallback(async () => {
    // TODO: this is a mockup, replace with real implementation
    setTransactionProgress(20);
    const result = await onTransactionStart(amountDecimal);
    setTransactionHash(result);
  }, [amountDecimal, onTransactionStart]);

  return (
    <>
      <CurrencyInput
        tokens={tokens}
        maxAmount={balance}
        disabled={disabledInput}
        error={insufficientBalance ? t('CurrencyInputModal.insufficientBalanceError') : undefined}
        onAmountUpdate={handleAmountChange}
        onCurrencyUpdate={onCurrencyUpdate}
      />
      {infoRows && <div className="tc__currency-input-modal__info">{infoRows}</div>}
      <div className="tc__currency-input-modal__action-container">
        {selectedPool && (
          <FeeTooltip fees={fees}>
            <div className="tc__currency-input-modal__transaction-info">
              <Icon variant="info-bordered" size="small" />
              <Typography variant="body-secondary">{t('CurrencyInputModal.feesAndTransactionInfo')}</Typography>
            </div>
          </FeeTooltip>
        )}
        <ActionButton
          labels={actionButtonLabels}
          onClick={handleActionButtonClick}
          variant="primary"
          size="large"
          fullWidth
          state={amountDecimal.lte(0) || insufficientBalance ? 'disabled' : actionButtonState}
        />
        {transactionProgress !== null && actionButtonState !== 'default' && (
          <ProgressBar value={actionButtonState === 'success' ? 100 : transactionProgress} />
        )}
        {chainConfig && transactionHash && actionButtonState !== 'default' && (
          <Link
            href={`${chainConfig.blockExplorerUrl}tx/${transactionHash}`}
            className="tc__currency-input-modal__transaction-link"
          >
            <Typography variant="body-secondary">
              {t('CurrencyInputModal.linkBlockExplorer', { name: chainConfig.blockExplorerName })}
            </Typography>
            <Icon variant="external" size="small" />
          </Link>
        )}
      </div>
    </>
  );
};

export default ModalActionContent;
