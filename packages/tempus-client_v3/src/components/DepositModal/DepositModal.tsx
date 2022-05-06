import { FC, useCallback, useMemo, useState } from 'react';
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

  const actionButtonLabels: ActionButtonLabels = approved
    ? { default: 'Execute', loading: 'Executing...', success: 'Successfully Executed' }
    : { default: 'Approve Deposit', loading: 'Approving...', success: 'Successfully Approved' };

  const infoRows = useMemo(() => {
    // TODO: Replace with real yield based on input amount
    const yieldAtMaturity = amount.mul(0.1);
    return (
      <>
        <CurrencyInputModalInfoRow label="Available for Deposit" value={balance.toString()} currency={currency} />
        <CurrencyInputModalInfoRow
          label="Yield-at-Maturity"
          value={`${yieldAtMaturity}`}
          valueChange="increase"
          currency="stETH"
        />
      </>
    );
  }, [amount, balance, currency]);

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
      title="Pool Details"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      header={<DepositModalHeader />}
      maturityTerms={maturityTerms}
      inputPrecision={inputPrecision}
      balance={balance}
      usdRates={usdRates}
      infoRows={infoRows}
      actionButtonLabels={actionButtonLabels}
      actionButtonState={actionButtonState}
      onActionButtonClick={approved ? deposit : approveDeposit}
      onAmountChange={setAmount}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default DepositModal;
