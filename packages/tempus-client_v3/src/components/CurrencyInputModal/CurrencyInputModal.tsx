import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Decimal, Ticker } from 'tempus-core-services';
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

interface CurrencyInputModalProps extends ModalProps {
  description: string;
  balance: Decimal;
  inputPrecision: number;
  usdRates: Map<Ticker, Decimal>;
  maturityTerms?: MaturityTerm[];
  infoRows: ReactNode;
  actionButtonLabels: ActionButtonLabels;
  onActionButtonClick: () => string;
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
    infoRows,
    actionButtonLabels,
    onActionButtonClick,
    onCurrencyUpdate,
  } = props;
  const [amount, setAmount] = useState('');
  const [transactionState, setTransactionState] = useState<ActionButtonState>('default');
  const [transactionProgress, setTransactionProgress] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);

  const disabledInput = transactionState !== 'default';
  const insufficientBalance = amountDecimal.gt(balance);

  const handleActionButtonClick = useCallback(() => {
    // TODO: this is a mockup, replace with real implementation
    setTransactionState('loading');
    setTransactionProgress(20);
    setTransactionHash(onActionButtonClick());

    setTimeout(() => {
      setTransactionState('success');
      setTransactionProgress(100);
    }, 5000);
  }, [onActionButtonClick]);

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
      {maturityTerms && maturityTerms.length > 1 && <TermTabs terms={maturityTerms} />}
      <CurrencyInput
        precision={inputPrecision}
        maxAmount={balance}
        usdRates={usdRates}
        disabled={disabledInput}
        error={insufficientBalance ? 'Insufficient balance' : undefined}
        onAmountUpdate={setAmount}
        onCurrencyUpdate={onCurrencyUpdate}
      />
      {infoRows && <div className="tc__currency-input-modal__info">{infoRows}</div>}
      <div className="tc__currency-input-modal__action-container">
        <FeeTooltip fees={{ swap: 0.002 }}>
          <div className="tc__currency-input-modal__transaction-info">
            <Typography variant="body-primary">Fees &amp; transaction info</Typography>
            <Icon variant="info-bordered" size={14} />
          </div>
        </FeeTooltip>
        <ActionButton
          labels={actionButtonLabels}
          onClick={handleActionButtonClick}
          variant="primary"
          size="large"
          fullWidth
          state={amountDecimal.lte(0) || insufficientBalance ? 'disabled' : transactionState}
        />
        {transactionProgress !== null && <ProgressBar value={transactionProgress} />}
        {/* TODO: Use FTMScan for Fantom pools */}
        {transactionHash && (
          <Link
            href={`https://etherscan.io/tx/${transactionHash}`}
            className="tc__currency-input-modal__transaction-link"
          >
            <Typography variant="body-secondary">Check it out on Etherscan</Typography>
            <Icon variant="external" size="small" />
          </Link>
        )}
      </div>
    </Modal>
  );
};

export default CurrencyInputModal;
