import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import FeeTooltip from '../FeeTooltip';
import {
  ActionButton,
  ActionButtonLabels,
  ActionButtonState,
  ButtonWrapper,
  CurrencyInput,
  Icon,
  Link,
  Modal,
  ProgressBar,
  Typography,
} from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import TermTabs, { MaturityTerm } from '../shared/TermTabs';
import './CurrencyInputModal.scss';

export interface CurrencyInputModalProps extends ModalProps {
  description: string;
  balance: Decimal;
  inputPrecision: number;
  usdRates: Map<Ticker, Decimal>;
  maturityTerms?: MaturityTerm[];
  chainConfig?: ChainConfig;
  infoRows?: ReactNode;
  actionButtonLabels: ActionButtonLabels;
  actionButtonState?: ActionButtonState;
  onAmountChange?: (amount: Decimal) => void;
  onTransactionStart: (amount: Decimal) => string;
  onCurrencyUpdate?: (currency: Ticker) => void;
}

const CurrencyInputModal: FC<CurrencyInputModalProps> = props => {
  const {
    title,
    description,
    open,
    onClose,
    header,
    balance,
    inputPrecision,
    usdRates,
    maturityTerms,
    chainConfig,
    infoRows,
    actionButtonLabels,
    actionButtonState = 'default',
    onAmountChange,
    onTransactionStart,
    onCurrencyUpdate,
  } = props;
  const [amount, setAmount] = useState('');
  const [transactionProgress, setTransactionProgress] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { t } = useTranslation();

  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);

  const disabledInput = actionButtonState !== 'default';
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
    <Modal
      className="tc__currency-input-modal"
      variant="styled"
      size="large"
      header={header}
      open={open}
      onClose={onClose}
    >
      <div className="tc__currency-input-modal__nav">
        <ButtonWrapper onClick={onClose}>
          <Icon variant="left-chevron" size="small" />
        </ButtonWrapper>
        <Typography variant="subtitle" weight="bold">
          {title}
        </Typography>
      </div>
      <Typography className="tc__currency-input-modal__description" variant="body-primary">
        {description}
      </Typography>
      {maturityTerms && maturityTerms.length > 1 && <TermTabs terms={maturityTerms} disabled={disabledInput} />}
      <CurrencyInput
        precision={inputPrecision}
        maxAmount={balance}
        usdRates={usdRates}
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
    </Modal>
  );
};

export default CurrencyInputModal;
