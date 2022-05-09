import { FC, useCallback, useMemo, useState } from 'react';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';

interface WithdrawModalProps extends ModalProps {
  inputPrecision: number;
  usdRates: Map<Ticker, Decimal>;
  chainConfig?: ChainConfig;
}

const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { open, onClose, inputPrecision, usdRates, chainConfig } = props;
  const [balance, setBalance] = useState(new Decimal(100)); // TODO: load balance for selected token
  const [currency, setCurrency] = useState(Array.from(usdRates.keys())[0]);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');

  const infoRows = useMemo(
    () => <CurrencyInputModalInfoRow label="Available for Withdraw" value={balance.toString()} currency={currency} />,
    [balance, currency],
  );

  const handleCurrencyChange = useCallback((newCurrency: Ticker) => {
    // TODO: load balance for new currency
    setBalance(new Decimal(101));
    setCurrency(newCurrency);
  }, []);

  const withdraw = useCallback(() => {
    // TODO: Implement withdraw function
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
      title="Position Details"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      inputPrecision={inputPrecision}
      balance={balance}
      usdRates={usdRates}
      infoRows={infoRows}
      actionButtonLabels={{ default: 'Execute Withdrawal', loading: 'Executing...', success: 'Successfully Executed' }}
      actionButtonState={actionButtonState}
      onTransactionStart={withdraw}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default WithdrawModal;
