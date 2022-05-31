import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { TokenMetadataProp } from '../../interfaces/TokenMetadata';
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
  balance: Decimal;
  tokens: TokenMetadataProp;
  disabledInput: boolean;
  chainConfig?: ChainConfig;
  infoRows?: ReactNode;
  actionButtonLabels: ActionButtonLabels;
  actionButtonState: ActionButtonState;
  onAmountChange?: (amount: Decimal) => void;
  onTransactionStart: (amount: Decimal) => string;
  onCurrencyUpdate?: (currency: Ticker) => void;
}

const ModalActionContent: FC<ModalActionContentProps> = props => {
  const {
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

  const [amount, setAmount] = useState('');
  const [transactionProgress, setTransactionProgress] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);

  const insufficientBalance = amountDecimal.gt(balance);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      onAmountChange?.(Decimal.parse(value, 0));
    },
    [onAmountChange],
  );

  const handleActionButtonClick = useCallback(() => {
    // TODO: this is a mockup, replace with real implementation
    setTransactionProgress(20);
    setTransactionHash(onTransactionStart(amountDecimal));
  }, [amountDecimal, onTransactionStart]);

  return (
    <>
      <CurrencyInput
        tokens={tokens}
        maxAmount={balance}
        disabled={disabledInput}
        error={insufficientBalance ? 'Insufficient balance' : undefined}
        onAmountUpdate={handleAmountChange}
        onCurrencyUpdate={onCurrencyUpdate}
      />
      {infoRows && <div className="tc__currency-input-modal__info">{infoRows}</div>}
      <div className="tc__currency-input-modal__action-container">
        <FeeTooltip fees={{ swap: 0.002 }}>
          <div className="tc__currency-input-modal__transaction-info">
            <Typography variant="body-primary">{t('CurrencyInputModal.feesAndTransactionInfo')}</Typography>
            <Icon variant="info-bordered" size="small" />
          </div>
        </FeeTooltip>
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
