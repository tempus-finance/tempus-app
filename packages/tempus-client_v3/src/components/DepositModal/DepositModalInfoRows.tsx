import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { useYieldAtMaturity } from '../../hooks';
import { TokenMetadata } from '../../interfaces/TokenMetadata';
import { CurrencyInputModalInfoRow } from '../CurrencyInputModal';

interface DepositModalInfoRowsProps {
  balance: Decimal;
  balanceToken: TokenMetadata;
  yieldToken: TokenMetadata;
}

const DepositModalInfoRows: FC<DepositModalInfoRowsProps> = props => {
  const { balance, balanceToken, yieldToken } = props;
  const yieldAtMaturity = useYieldAtMaturity();
  const { t } = useTranslation();

  return (
    <>
      <CurrencyInputModalInfoRow
        label={t('DepositModal.labelAvailableForDeposit')}
        value={DecimalUtils.formatToCurrency(balance, balanceToken.precisionForUI)}
        currency={balanceToken.ticker}
      />
      <CurrencyInputModalInfoRow
        label={t('DepositModal.labelYieldAtMaturity')}
        value={DecimalUtils.formatToCurrency(yieldAtMaturity, yieldToken.precisionForUI)}
        valueChange="increase"
        currency={yieldToken.ticker}
      />
    </>
  );
};

export default memo(DepositModalInfoRows);
