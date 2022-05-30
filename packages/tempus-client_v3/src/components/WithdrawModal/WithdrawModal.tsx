import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';

export interface WithdrawModalProps extends ModalProps {
  tokens: {
    precision: number;
    ticker: Ticker;
    rate: Decimal;
  }[];
  chainConfig?: ChainConfig;
}

export const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { open, onClose, tokens, chainConfig } = props;
  const [balance, setBalance] = useState(new Decimal(100)); // TODO: load balance for selected token
  const [currency, setCurrency] = useState(tokens[0].ticker);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const { t } = useTranslation();

  const infoRows = useMemo(
    () => (
      <CurrencyInputModalInfoRow
        label={t('WithdrawModal.labelAvailableForWithdraw')}
        value={balance.toString()}
        currency={currency}
      />
    ),
    [balance, currency, t],
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
      onTransactionStart={withdraw}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};
