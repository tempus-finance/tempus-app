import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { ModalProps } from '../shared/Modal/Modal';
import { MaturityTerm } from '../shared/TermTabs';
import DepositModalHeader from './DepositModalHeader';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonLabels, ActionButtonState } from '../shared';
import './DepositModal.scss';

interface DepositModalProps extends ModalProps {
  inputPrecision: number;
  usdRates: Map<Ticker, Decimal>;
  maturityTerms: MaturityTerm[];
  chainConfig?: ChainConfig;
}

const DepositModal: FC<DepositModalProps> = props => {
  const { open, onClose, inputPrecision, usdRates, maturityTerms, chainConfig } = props;
  const [balance, setBalance] = useState(new Decimal(100)); // TODO: load balance for selected token
  const [amount, setAmount] = useState(new Decimal(0));
  const [currency, setCurrency] = useState(Array.from(usdRates.keys())[0]);
  const [approved, setApproved] = useState(false);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const { t } = useTranslation();

  const actionButtonLabels: ActionButtonLabels = approved
    ? {
        default: t('DepositModal.labelExecuteDefault'),
        loading: t('DepositModal.labelExecuteLoading'),
        success: t('DepositModal.labelExecuteSuccess'),
      }
    : {
        default: t('DepositModal.labelApproveDefault'),
        loading: t('DepositModal.labelApproveLoading'),
        success: t('DepositModal.labelApproveSuccess'),
      };

  const infoRows = useMemo(() => {
    // TODO: Replace with real yield based on input amount
    const yieldAtMaturity = amount.mul(0.1);
    return (
      <>
        <CurrencyInputModalInfoRow
          label={t('DepositModal.labelAvailableForDeposit')}
          value={balance.toString()}
          currency={currency}
        />
        <CurrencyInputModalInfoRow
          label={t('DepositModal.labelYieldAtMaturity')}
          value={`${yieldAtMaturity}`}
          valueChange="increase"
          currency="stETH"
        />
      </>
    );
  }, [amount, balance, currency, t]);

  const handleCurrencyChange = useCallback((newCurrency: Ticker) => {
    // TODO: load balance for new currency
    setBalance(new Decimal(101));
    setCurrency(newCurrency);
  }, []);

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
      open={open}
      onClose={onClose}
      title={t('DepositModal.title')}
      description={t('DepositModal.description')}
      header={<DepositModalHeader />}
      maturityTerms={maturityTerms}
      inputPrecision={inputPrecision}
      balance={balance}
      usdRates={usdRates}
      infoRows={infoRows}
      actionButtonLabels={actionButtonLabels}
      actionButtonState={actionButtonState}
      onTransactionStart={approved ? deposit : approveDeposit}
      onAmountChange={setAmount}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default DepositModal;
