import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, Ticker, ZERO } from 'tempus-core-services';
import { TokenMetadataProp } from '../../interfaces';
import CurrencyInputModal, { CurrencyInputModalInfoRow } from '../CurrencyInputModal';
import { ActionButtonState } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';

export interface WithdrawModalProps extends ModalProps {
  tokens: TokenMetadataProp;
  chainConfig?: ChainConfig;
}

export const WithdrawModal: FC<WithdrawModalProps> = props => {
  const { open, onClose, tokens, chainConfig } = props;

  const [balance, setBalance] = useState(tokens[0].balance.div(tokens[0].rate));
  const [currency, setCurrency] = useState(tokens[0].ticker);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const { t } = useTranslation();

  const infoRows = useMemo(
    () => (
      <CurrencyInputModalInfoRow
        label={t('WithdrawModal.labelAvailableForWithdraw')}
        value={balance.toString() || ZERO.toString()}
        currency={currency}
      />
    ),
    [balance, currency, t],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Ticker) => {
      const tokenMetadata = tokens.find(token => token.ticker === newCurrency);
      if (tokenMetadata) {
        setBalance(tokenMetadata.balance.div(tokenMetadata.rate));
      }
      setCurrency(newCurrency);
    },
    [tokens],
  );

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
